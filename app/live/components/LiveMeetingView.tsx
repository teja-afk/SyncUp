"use client";

import { CalendarEvent } from "@/app/home/hooks/useMeetings";
import {
  LiveSegment,
  loadTranscript,
  saveTranscript,
} from "@/app/live/lib/transcriptStorage";
import LiveTranscriber, { LiveTranscriberHandle } from "@/components/LiveTranscriber";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Mic, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface LiveMeetingViewProps {
  upcomingEvents: CalendarEvent[];
  connected: boolean;
  loading: boolean;
  error: string;
  onRefreshCalendar?: () => void;
  onMeetingSaved?: () => void;
}

type MeetingOption = {
  storageId: string;
  dbMeetingId: string | null;
  title: string;
  startLabel?: string;
};

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "can",
  "did",
  "do",
  "for",
  "from",
  "had",
  "has",
  "have",
  "he",
  "her",
  "his",
  "i",
  "if",
  "in",
  "is",
  "it",
  "its",
  "me",
  "my",
  "not",
  "of",
  "on",
  "or",
  "our",
  "she",
  "so",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "they",
  "this",
  "to",
  "too",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "will",
  "with",
  "you",
  "your",
  "hai",
  "hain",
  "ka",
  "ke",
  "ki",
  "mein",
  "me",
  "se",
  "aur",
  "kya",
  "ye",
  "woh",
  "wo",
  "hain",
  "tha",
  "thi",
  "the",
]);

const normalizeText = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^\w\u0900-\u097F\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenIsValid = (token: string) => {
  if (!token) return false;
  if (STOPWORDS.has(token)) return false;
  if (/^\d+$/.test(token)) return false;
  if (token.length >= 3) return true;
  return /[\u0900-\u097F]/.test(token) && token.length >= 2;
};

const getCurrentTopic = (segments: LiveSegment[], partial: string) => {
  const recentText = segments.slice(-12).map((segment) => segment.text).join(" ");
  const combined = normalizeText(`${recentText} ${partial || ""}`);
  if (!combined) return null;

  const tokens = combined.split(" ").filter(tokenIsValid);
  if (tokens.length === 0) return null;

  const unigramCounts = new Map<string, number>();
  const bigramCounts = new Map<string, number>();

  tokens.forEach((token, index) => {
    unigramCounts.set(token, (unigramCounts.get(token) || 0) + 1);
    if (index < tokens.length - 1) {
      const next = tokens[index + 1];
      if (tokenIsValid(next)) {
        const bigram = `${token} ${next}`;
        bigramCounts.set(bigram, (bigramCounts.get(bigram) || 0) + 1);
      }
    }
  });

  const pickTop = (counts: Map<string, number>) => {
    let topKey = "";
    let topCount = 0;
    counts.forEach((count, key) => {
      if (count > topCount) {
        topKey = key;
        topCount = count;
      }
    });
    return topKey ? { key: topKey, count: topCount } : null;
  };

  const topBigram = pickTop(bigramCounts);
  if (topBigram && topBigram.count >= 2) {
    return topBigram.key;
  }

  const topUnigram = pickTop(unigramCounts);
  if (topUnigram) {
    return topUnigram.key;
  }

  return null;
};

function LiveMeetingView({
  upcomingEvents,
  connected,
  loading,
  error,
  onRefreshCalendar,
  onMeetingSaved,
}: LiveMeetingViewProps) {
  const transcriberRef = useRef<LiveTranscriberHandle | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mixedStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const transcriptionStartRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string>("");
  const autosaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const summaryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const summaryInFlightRef = useRef(false);
  const hasSegmentEventsRef = useRef(false);
  const latestSegmentsRef = useRef<LiveSegment[]>([]);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  const [displayStream, setDisplayStream] = useState<MediaStream | null>(null);
  const [sharing, setSharing] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [warning, setWarning] = useState("");
  const [localError, setLocalError] = useState("");
  const [segments, setSegments] = useState<LiveSegment[]>([]);
  const [partial, setPartial] = useState("");
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [selectedMeetingTitle, setSelectedMeetingTitle] = useState("");
  const [selectedDbMeetingId, setSelectedDbMeetingId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [liveSummary, setLiveSummary] = useState<{
    topic?: string;
    summary?: string;
    bullets?: string[];
  } | null>(null);
  const [summaryStatus, setSummaryStatus] = useState("");
  const [summaryUpdatedAt, setSummaryUpdatedAt] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [finalSummary, setFinalSummary] = useState("");
  const [finalActionItems, setFinalActionItems] = useState<string[]>([]);
  const [finalSummaryStatus, setFinalSummaryStatus] = useState("");

  const displayTopic = useMemo(() => {
    const topic = liveSummary?.topic?.trim();
    if (topic && topic.length > 0) return topic;
    // Only show "Listening..." instead of using unreliable frequency-based topic
    return "Listening...";
  }, [liveSummary]);

  useEffect(() => {
    latestSegmentsRef.current = segments;
  }, [segments]);

  const meetingOptions = useMemo<MeetingOption[]>(() => {
    if (!upcomingEvents || upcomingEvents.length === 0) {
      return [];
    }
    return upcomingEvents.map((event) => {
      const startValue = event.start?.dateTime || event.start?.date;
      return {
        storageId: event.meetingId || event.id,
        dbMeetingId: event.meetingId ?? null,
        title: event.summary || "Untitled meeting",
        startLabel: startValue ? format(new Date(startValue), "MMM d, h:mm a") : undefined,
      };
    });
  }, [upcomingEvents]);

  const nextEvent = useMemo(() => {
    if (!upcomingEvents || upcomingEvents.length === 0) {
      return null;
    }
    return upcomingEvents[0];
  }, [upcomingEvents]);

  useEffect(() => {
    if (meetingOptions.length === 0) {
      if (!selectedMeetingId) {
        setSelectedMeetingId("local");
        setSelectedMeetingTitle("Unlinked session");
        setSelectedDbMeetingId(null);
      }
      return;
    }

    const current = meetingOptions.find((option) => option.storageId === selectedMeetingId);
    if (!current) {
      const first = meetingOptions[0];
      setSelectedMeetingId(first.storageId);
      setSelectedMeetingTitle(first.title);
      setSelectedDbMeetingId(first.dbMeetingId);
    }
  }, [meetingOptions, selectedMeetingId]);

  useEffect(() => {
    if (!selectedMeetingId) {
      return;
    }
    // Always clear transcript for new local sessions
    if (selectedMeetingId === 'local') {
      setSegments([]);
      setPartial("");
      setStartedAt(null);
      // Clear localStorage for this session
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('transcript_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } else {
      // Load transcript for saved meetings from database
      const stored = loadTranscript(selectedMeetingId);
      if (stored) {
        setSegments(stored.segments || []);
        setStartedAt(stored.startedAt || null);
        if (stored.meetingTitle && stored.meetingTitle !== selectedMeetingTitle) {
          setSelectedMeetingTitle(stored.meetingTitle);
        }
      } else {
        setSegments([]);
        setStartedAt(null);
      }
    }
    setPartial("");
    setStorageWarning("");
    setSaveStatus("");
    setLiveSummary(null);
    setSummaryStatus("");
    setSummaryUpdatedAt(null);
    setFinalSummary("");
    setFinalActionItems([]);
    setFinalSummaryStatus("");
  }, [selectedMeetingId]);

  const persistLocal = useCallback(
    (segmentsToSave: LiveSegment[], startedOverride?: string | null) => {
      if (!selectedMeetingId) return;
      const resolvedStart =
        startedOverride ||
        startedAt ||
        (transcriptionStartRef.current
          ? new Date(transcriptionStartRef.current).toISOString()
          : new Date().toISOString());
      if (!startedAt) {
        setStartedAt(resolvedStart);
      }
      const { trimmed } = saveTranscript(selectedMeetingId, {
        meetingId: selectedMeetingId,
        meetingTitle: selectedMeetingTitle || undefined,
        startedAt: resolvedStart,
        segments: segmentsToSave,
      });
      if (trimmed) {
        setStorageWarning(
          "Transcript is large. Only the most recent segments are kept locally."
        );
      }
    },
    [selectedMeetingId, selectedMeetingTitle, startedAt]
  );

  const queuePersist = useCallback(
    (segmentsToSave: LiveSegment[]) => {
      if (debounceSaveRef.current) {
        clearTimeout(debounceSaveRef.current);
      }
      debounceSaveRef.current = setTimeout(() => {
        persistLocal(segmentsToSave);
      }, 500);
    },
    [persistLocal]
  );

  useEffect(() => {
    if (!transcribing || !selectedMeetingId) {
      if (autosaveRef.current) {
        clearInterval(autosaveRef.current);
        autosaveRef.current = null;
      }
      return;
    }

    if (autosaveRef.current) {
      clearInterval(autosaveRef.current);
    }
    autosaveRef.current = setInterval(() => {
      persistLocal(latestSegmentsRef.current);
    }, 30000);

    return () => {
      if (autosaveRef.current) {
        clearInterval(autosaveRef.current);
        autosaveRef.current = null;
      }
    };
  }, [transcribing, selectedMeetingId, persistLocal]);

  const runSummary = useCallback(async () => {
    if (summaryInFlightRef.current) {
      return;
    }
    const recentSegments = latestSegmentsRef.current.slice(-40);
    if (recentSegments.length < 3) {
      return;
    }
    summaryInFlightRef.current = true;
    setSummarizing(true);
    setSummaryStatus("Updating summary...");
    try {
      const response = await fetch("/api/live/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: recentSegments.map((segment) => ({
            speaker: segment.speaker,
            text: segment.text,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setSummaryStatus(data?.error || "Summary unavailable.");
        summaryInFlightRef.current = false;
        return;
      }

      const data = await response.json();
      setLiveSummary({
        topic: data?.topic || "",
        summary: data?.summary || "",
        bullets: Array.isArray(data?.bullets) ? data.bullets : [],
      });
      setSummaryUpdatedAt(new Date().toLocaleTimeString());
      setSummaryStatus("");
    } catch {
      setSummaryStatus("Summary unavailable.");
    } finally {
      summaryInFlightRef.current = false;
      setSummarizing(false);
    }
  }, []);

  useEffect(() => {
    if (!transcribing) {
      if (summaryIntervalRef.current) {
        clearInterval(summaryIntervalRef.current);
        summaryIntervalRef.current = null;
      }
      return;
    }

    if (summaryIntervalRef.current) {
      clearInterval(summaryIntervalRef.current);
    }

    // Update summary every 30 seconds for more responsive topic detection
    summaryIntervalRef.current = setInterval(() => {
      runSummary();
    }, 30000);

    // Run initial summary after 10 seconds to get topic quickly
    const initialTimeout = setTimeout(() => {
      runSummary();
    }, 10000);

    return () => {
      if (summaryIntervalRef.current) {
        clearInterval(summaryIntervalRef.current);
        summaryIntervalRef.current = null;
      }
      clearTimeout(initialTimeout);
    };
  }, [transcribing, runSummary]);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }
    if (displayStream) {
      videoRef.current.srcObject = displayStream;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.srcObject = null;
    }
  }, [displayStream]);

  const cleanupStreams = () => {
    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
    }
    displayStreamRef.current = null;
    micStreamRef.current = null;
    mixedStreamRef.current = null;
    audioCtxRef.current = null;
    audioDestRef.current = null;
    setDisplayStream(null);
  };

  useEffect(() => {
    return () => {
      cleanupStreams();
      if (autosaveRef.current) {
        clearInterval(autosaveRef.current);
      }
      if (debounceSaveRef.current) {
        clearTimeout(debounceSaveRef.current);
      }
      if (summaryIntervalRef.current) {
        clearInterval(summaryIntervalRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when new transcript segments are added
  useEffect(() => {
    if (transcriptContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      const scrollToBottom = () => {
        if (transcriptContainerRef.current) {
          transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
        }
      };

      // Small delay to ensure the new content is rendered
      const timeoutId = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [segments, partial]);

  const stopTranscription = async () => {
    // Don't proceed if there's no content to save
    if (segments.length === 0 && latestSegmentsRef.current.length === 0) {
      return;
    }

    // Stop the transcriber if it's running
    if (transcribing) {
      try {
        transcriberRef.current?.stop();
      } catch {}
    }
    setTranscribing(false);
    if (autosaveRef.current) {
      clearInterval(autosaveRef.current);
      autosaveRef.current = null;
    }
    if (debounceSaveRef.current) {
      clearTimeout(debounceSaveRef.current);
      debounceSaveRef.current = null;
    }

    const endedAt = new Date().toISOString();
    const finalSegments = latestSegmentsRef.current;
    const resolvedStart =
      startedAt ||
      (transcriptionStartRef.current
        ? new Date(transcriptionStartRef.current).toISOString()
        : new Date().toISOString());
    if (selectedMeetingId) {
      persistLocal(finalSegments, resolvedStart);
    }

    const shouldSummarize = finalSegments.length >= 3;
    setFinalSummaryStatus("");
    setFinalSummary("");
    setFinalActionItems([]);

    const runLocalSummary = async () => {
      if (!shouldSummarize) {
        setFinalSummaryStatus("Not enough transcript to summarize.");
        return;
      }
      setFinalSummaryStatus("Generating final summary...");
      try {
        const response = await fetch("/api/live/final-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ segments: finalSegments }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setFinalSummaryStatus(data?.error || "Failed to summarize meeting.");
          return;
        }
        const data = await response.json();
        setFinalSummary(data?.summary || "");
        const items = Array.isArray(data?.actionItems)
          ? data.actionItems.map((item: any) => item.text || String(item))
          : [];
        setFinalActionItems(items);
        setFinalSummaryStatus("");
      } catch {
        setFinalSummaryStatus("Failed to summarize meeting.");
      }
    };

    const fallbackToLocal = async (message: string) => {
      setSaveStatus(message);
      await runLocalSummary();
    };

    let meetingIdForSave = selectedDbMeetingId;

    if (!meetingIdForSave) {
      setSaveStatus("Saving transcript to meeting history...");
      const trimmedTitle = (selectedMeetingTitle || "").trim();
      const startDate = new Date(resolvedStart);
      const derivedTitle =
        trimmedTitle && trimmedTitle !== "Unlinked session"
          ? trimmedTitle
          : Number.isNaN(startDate.getTime())
            ? "Live meeting"
            : `Live meeting ${format(startDate, "MMM d, h:mm a")}`;

      try {
        const createResponse = await fetch("/api/meetings/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: derivedTitle,
            startTime: resolvedStart,
            endTime: endedAt,
          }),
        });

        if (!createResponse.ok) {
          const data = await createResponse.json().catch(() => ({}));
          const errorMessage = data?.error
            ? `${data.error} Saved locally instead.`
            : "Failed to save to meeting history. Saved locally instead.";
          await fallbackToLocal(errorMessage);
          return;
        }

        const data = await createResponse.json();
        meetingIdForSave = data?.meeting?.id ?? null;
        if (!meetingIdForSave) {
          await fallbackToLocal(
            "Failed to save to meeting history. Saved locally instead."
          );
          return;
        }
        setSelectedDbMeetingId(meetingIdForSave);
      } catch {
        await fallbackToLocal(
          "Failed to save to meeting history. Saved locally instead."
        );
        return;
      }
    }

    if (!meetingIdForSave) {
      await fallbackToLocal(
        "Failed to save to meeting history. Saved locally instead."
      );
      return;
    }

    setSaveStatus("Saving transcript to meeting history...");
    if (shouldSummarize) {
      setFinalSummaryStatus("Generating final summary...");
    } else {
      setFinalSummaryStatus("Not enough transcript to summarize.");
    }
    try {
      const response = await fetch(
        `/api/meetings/${meetingIdForSave}/transcript`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            segments: finalSegments,
            startedAt: resolvedStart,
            endedAt,
            summarize: shouldSummarize,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setSaveStatus(
          data?.error || "Failed to save transcript to meeting history."
        );
        return;
      }

      const data = await response.json();
      setSaveStatus("Saved to meeting history.");
      if (shouldSummarize) {
        setFinalSummary(data?.summary || "");
        const items = Array.isArray(data?.actionItems)
          ? data.actionItems.map((item: any) => item.text || String(item))
          : [];
        setFinalActionItems(items);
        setFinalSummaryStatus("");
      }
      // Refresh past meetings list after successful save
      if (onMeetingSaved) {
        onMeetingSaved();
      }
    } catch {
      setSaveStatus("Failed to save transcript to meeting history.");
    }
  };

  const stopAll = async () => {
    // Always attempt to save the meeting if there's content
    await stopTranscription();
    cleanupStreams();
    setSharing(false);
    setPartial("");
  };

  const startShare = async () => {
    setLocalError("");
    setWarning("");
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      displayStreamRef.current = display;
      setDisplayStream(display);
      setSharing(true);

      const audioCtx = new AudioContext({ sampleRate: 48000 });
      audioCtxRef.current = audioCtx;
      const dest = audioCtx.createMediaStreamDestination();
      audioDestRef.current = dest;

      if (display.getAudioTracks().length > 0) {
        const displaySource = audioCtx.createMediaStreamSource(display);
        displaySource.connect(dest);
      } else {
        setWarning("Tab audio not captured. Re-share and enable tab audio.");
      }

      try {
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = mic;
        const micSource = audioCtx.createMediaStreamSource(mic);
        micSource.connect(dest);
      } catch {
        setWarning((prev) =>
          prev
            ? `${prev} Mic not available.`
            : "Mic not available. Transcription will use tab audio only."
        );
      }

      mixedStreamRef.current = dest.stream;

      const videoTrack = display.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopAll();
          setWarning("Screen share stopped.");
        };
      }
    } catch {
      cleanupStreams();
      setSharing(false);
      setLocalError("Failed to start screen share. Try again and allow permissions.");
    }
  };

  const startTranscription = async () => {
    setLocalError("");
    if (!mixedStreamRef.current) {
      setLocalError("Share a Google Meet tab first.");
      return;
    }

    sessionIdRef.current =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `session-${Date.now()}`;

    const startTimestamp =
      startedAt && !Number.isNaN(new Date(startedAt).getTime())
        ? new Date(startedAt).getTime()
        : Date.now();
    transcriptionStartRef.current = startTimestamp;
    if (!startedAt) {
      setStartedAt(new Date(startTimestamp).toISOString());
    }
    setSaveStatus("");
    setStorageWarning("");
    setFinalSummary("");
    setFinalActionItems([]);
    setFinalSummaryStatus("");

    try {
      await transcriberRef.current?.start(mixedStreamRef.current);
      setTranscribing(true);
    } catch {
      setLocalError("Failed to start transcription.");
    }
  };

  const handleMeetingSelect = (value: string) => {
    const option = meetingOptions.find((item) => item.storageId === value);
    if (!option) {
      return;
    }
    setSelectedMeetingId(option.storageId);
    setSelectedMeetingTitle(option.title);
    setSelectedDbMeetingId(option.dbMeetingId);
  };

  const handleSegment = useCallback(
    (segment: { id?: number; start?: number; end?: number; text?: string; speaker?: string }) => {
      if (!segment.text) return;
      hasSegmentEventsRef.current = true;
      const startRef = transcriptionStartRef.current || Date.now();
      const offset =
        typeof segment.start === "number"
          ? segment.start
          : (Date.now() - startRef) / 1000;
      const nextSegment: LiveSegment = {
        id: segment.id,
        sessionId: sessionIdRef.current || undefined,
        speaker: segment.speaker || "Speaker 1",
        offset,
        end: typeof segment.end === "number" ? segment.end : undefined,
        text: segment.text,
      };

      setSegments((prev) => {
        const next = [...prev, nextSegment];
        queuePersist(next);
        return next;
      });
      setPartial("");
    },
    [queuePersist]
  );

  const handleSpeakerUpdate = useCallback(
    (update: { id: number; speaker: string }) => {
      if (!update?.id) return;
      setSegments((prev) => {
        let changed = false;
        const next = prev.map((segment) => {
          if (segment.id === update.id && segment.speaker !== update.speaker) {
            changed = true;
            return { ...segment, speaker: update.speaker };
          }
          return segment;
        });
        if (changed) {
          queuePersist(next);
        }
        return next;
      });
    },
    [queuePersist]
  );

  const handleFinal = (text: string) => {
    if (!text) return;
    if (hasSegmentEventsRef.current) {
      return;
    }
    const startRef = transcriptionStartRef.current || Date.now();
    const offset = (Date.now() - startRef) / 1000;
    const segment: LiveSegment = {
      sessionId: sessionIdRef.current || undefined,
      speaker: "Speaker 1",
      offset,
      text,
    };
    setSegments((prev) => {
      const next = [...prev, segment];
      queuePersist(next);
      return next;
    });
    setPartial("");
  };

  return (
    <div className="min-h-screen w-full bg-background p-6 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Meeting</h1>
          <p className="text-sm text-muted-foreground">
            Share your Google Meet tab to capture video and audio for live transcription.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Status:</span>
          <span className="text-foreground">
            {transcribing ? "Transcribing" : sharing ? "Sharing" : "Idle"}
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {connected ? (
              nextEvent ? (
                <span>
                  Next: <span className="text-foreground">{nextEvent.summary || "Untitled"}</span>{" "}
                  {nextEvent.start?.dateTime || nextEvent.start?.date
                    ? `- ${format(
                        new Date(nextEvent.start?.dateTime || nextEvent.start?.date || ""),
                        "MMM d, h:mm a"
                      )}`
                    : null}
                </span>
              ) : (
                "No upcoming meetings"
              )
            ) : (
              "Calendar not connected"
            )}
          </div>
          {onRefreshCalendar && (
            <Button
              className="h-8 text-xs"
              onClick={onRefreshCalendar}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Refreshing..." : "Refresh Calendar"}
            </Button>
          )}
        </div>

        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Linked meeting</div>
            <div className="text-xs text-muted-foreground">
              Select an upcoming meeting to link this session to a calendar event.
            </div>
          </div>
          {meetingOptions.length > 0 ? (
            <Select value={selectedMeetingId} onValueChange={handleMeetingSelect}>
              <SelectTrigger className="min-w-[240px]">
                <SelectValue placeholder="Select a meeting" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Upcoming meetings</SelectLabel>
                  {meetingOptions.map((option) => (
                    <SelectItem key={option.storageId} value={option.storageId}>
                      {option.startLabel ? `${option.title} (${option.startLabel})` : option.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <div className="text-xs text-muted-foreground md:text-right">
              No upcoming meetings to link. This session will still be saved to your history.
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-2 py-1">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-rows-[1fr_auto] gap-6 w-full">
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={startShare} disabled={sharing} className="h-8 text-xs">
              <Video className="h-3 w-3 mr-2" />
              Share Meet Tab
            </Button>
            <Button
              onClick={startTranscription}
              disabled={!sharing || transcribing}
              className="h-8 text-xs"
              variant="secondary"
            >
              <Mic className="h-3 w-3 mr-2" />
              Start Transcription
            </Button>
            <Button
              onClick={stopTranscription}
              disabled={!transcribing}
              className="h-8 text-xs"
              variant="outline"
            >
              Stop Transcription
            </Button>
            <Button onClick={stopAll} disabled={!sharing} className="h-8 text-xs" variant="outline">
              Stop Share
            </Button>
          </div>

          <div className="relative flex-1 rounded-md border border-border bg-muted overflow-hidden">
            <video
              ref={videoRef}
              className="h-full w-full object-contain bg-black"
              muted
              autoPlay
              playsInline
            />
            {!sharing && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground px-4 text-center">
                Share your Google Meet tab to preview it here.
              </div>
            )}
          </div>

          {warning && (
            <div className="text-xs text-yellow-500/90 bg-yellow-500/10 border border-yellow-500/20 rounded-md px-2 py-1">
              {warning}
            </div>
          )}
          {localError && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-2 py-1">
              {localError}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-4 h-80 w-full flex flex-col" style={{ minWidth: 0 }}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="text-sm font-semibold text-foreground">Live Transcript</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="uppercase tracking-wide">Current topic</span>
              <span className="rounded-full bg-muted px-2 py-1 text-foreground">
                {displayTopic}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto pr-1" style={{ minWidth: 0 }} ref={transcriptContainerRef}>
            <div className="space-y-3">
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-2">
                <span className="uppercase tracking-wide">Live Summary</span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={runSummary}
                  disabled={summarizing || segments.length < 3}
                >
                  {summarizing ? "Updating..." : "Update"}
                </Button>
              </div>
              {summaryStatus && (
                <div className="text-xs text-muted-foreground mb-2">{summaryStatus}</div>
              )}
              {!summaryStatus && summaryUpdatedAt && (
                <div className="text-xs text-muted-foreground mb-2">
                  Updated at {summaryUpdatedAt}
                </div>
              )}
              {liveSummary?.bullets && liveSummary.bullets.length > 0 ? (
                <ul className="list-disc pl-4 text-sm text-foreground space-y-1">
                  {liveSummary.bullets.slice(0, 5).map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : liveSummary?.summary ? (
                <p className="text-sm text-foreground">{liveSummary.summary}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Summary will appear once enough transcript is available.
                </p>
              )}
            </div>
            {(finalSummary || finalActionItems.length > 0 || finalSummaryStatus) && (
              <div className="rounded-md border border-border/60 bg-muted/10 p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Final Summary
                </div>
                {finalSummaryStatus && (
                  <div className="text-xs text-muted-foreground mb-2">
                    {finalSummaryStatus}
                  </div>
                )}
                {finalSummary && (
                  <p className="text-sm text-foreground mb-3">{finalSummary}</p>
                )}
                {finalActionItems.length > 0 ? (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2">
                      Action Items
                    </div>
                    <ul className="list-disc pl-4 text-sm text-foreground space-y-1">
                      {finalActionItems.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : finalSummary && !finalSummaryStatus ? (
                  <div className="text-xs text-muted-foreground">No action items detected.</div>
                ) : null}
              </div>
            )}
            <div className="w-full max-w-full" style={{ width: '100%' }}>
              {segments.length > 0 || partial ? (
                <div className="w-full max-w-full" style={{ width: '100%' }}>
                  {(() => {
                    // Group consecutive segments by speaker, keeping timestamps
                    const grouped: {
                      speaker: string;
                      segments: { text: string; timestamp: string; key: string }[]
                    }[] = [];

                    segments.forEach((segment, index) => {
                      const lastGroup = grouped[grouped.length - 1];
                      const minutes = Math.floor(segment.offset / 60);
                      const seconds = Math.floor(segment.offset % 60);
                      const timestamp = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                      const key = segment.sessionId
                        ? `segment-${segment.sessionId}-${segment.id ?? "x"}-${index}`
                        : segment.id
                          ? `segment-${segment.id}-${segment.offset}-${index}`
                          : `${segment.offset}-${index}`;

                      if (lastGroup && lastGroup.speaker === segment.speaker) {
                        // Same speaker - add to existing group
                        lastGroup.segments.push({ text: segment.text, timestamp, key });
                      } else {
                        // Different speaker - create new group
                        grouped.push({
                          speaker: segment.speaker,
                          segments: [{ text: segment.text, timestamp, key }]
                        });
                      }
                    });

                    return grouped.map((group, groupIndex) => (
                      <div
                        key={`group-${groupIndex}`}
                        className="w-full max-w-full"
                        style={{ marginTop: groupIndex === 0 ? '0' : '12px', width: '100%' }}
                      >
                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                          {group.speaker}
                        </div>
                        <div className="space-y-0.5">
                          {group.segments.map((seg) => (
                            <div
                              key={seg.key}
                              className="text-sm text-foreground leading-relaxed w-full max-w-full"
                              style={{
                                width: '100%',
                                maxWidth: '100%',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                display: 'block'
                              }}
                            >
                              <span className="text-muted-foreground text-xs mr-2">{seg.timestamp}</span>
                              <span>: {seg.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                  {partial ? (
                    <div
                      className="text-sm text-muted-foreground leading-relaxed w-full max-w-full mt-1"
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        display: 'block'
                      }}
                    >
                      {partial}
                    </div>
                  ) : null}
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Transcript will appear here once transcription starts.
                </span>
              )}
              <LiveTranscriber
                ref={transcriberRef}
                showControls={true}
                showTranscript={false}
                stopStreamOnStop={false}
                onFinal={handleFinal}
                onSegment={handleSegment}
                onSpeaker={handleSpeakerUpdate}
                onPartial={(text) => setPartial(text)}
              />
            </div>
            </div>
            {storageWarning && (
              <div className="text-xs text-yellow-500/90">{storageWarning}</div>
            )}
            {saveStatus && <div className="text-xs text-muted-foreground">{saveStatus}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveMeetingView;
