"use client";

interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

interface TranscriptSegment {
  words: TranscriptWord[];
  offset: number;
  speaker: string;
}

interface TranscriptDisplayProps {
  transcript: TranscriptSegment[] | string | null | undefined;
}

export default function TranscriptDisplay({
  transcript,
}: TranscriptDisplayProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getSpeakerSegmentTime = (segment: TranscriptSegment) => {
    const startTime = segment.offset || 0;
    const endTime =
      segment.words && segment.words.length > 0
        ? segment.words[segment.words.length - 1]?.end || startTime
        : startTime;

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const getSegmentText = (segment: TranscriptSegment) => {
    if (!segment.words || segment.words.length === 0) {
      return segment.text || '';
    }
    return segment.words.map((word) => word.word).join(" ");
  };

  // Parse transcript if it's a string (JSON from database)
  let parsedTranscript = transcript;
  if (typeof transcript === 'string') {
    try {
      parsedTranscript = JSON.parse(transcript);
    } catch (e) {
      console.error('Failed to parse transcript:', e);
      return (
        <div className="bg-card rounded-lg p-6 border border-border text-center">
          <p className="text-muted-foreground">Failed to parse transcript</p>
        </div>
      );
    }
  }

  // Handle different transcript formats
  if (!parsedTranscript) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border text-center">
        <p className="text-muted-foreground">No transcript available</p>
      </div>
    );
  }

  // Extract segments array if transcript is an object with segments property
  let transcriptArray: TranscriptSegment[] = [];

  if (Array.isArray(parsedTranscript)) {
    // Direct array format
    transcriptArray = parsedTranscript;
  } else if (parsedTranscript && typeof parsedTranscript === 'object' && 'segments' in parsedTranscript) {
    // Object with segments property
    transcriptArray = (parsedTranscript as { segments: TranscriptSegment[] }).segments;
  } else {
    console.error('Unexpected transcript format:', parsedTranscript);
    return (
      <div className="bg-card rounded-lg p-6 border border-border text-center">
        <p className="text-muted-foreground">Invalid transcript format</p>
      </div>
    );
  }

  // Check if we have valid transcript data
  if (!Array.isArray(transcriptArray) || transcriptArray.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border text-center">
        <p className="text-muted-foreground">No transcript available</p>
      </div>
    );
  }


  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Meeting transcript
      </h3>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {transcriptArray.map((segment: TranscriptSegment, index: number) => (
          <div
            key={index}
            className="pb-4 border-b border-border last:border-b-0"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="font-medium text-foreground">
                {segment.speaker}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {getSpeakerSegmentTime(segment)}
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed pl-4">
              {getSegmentText(segment)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
