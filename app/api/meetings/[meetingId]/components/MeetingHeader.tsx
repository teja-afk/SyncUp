import { Button } from '@/components/ui/button'
import { Check, Eye, Share2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

interface MeetingHeaderProps {
    title : string
    meetingId : string
    summary? : string
    actionItems?: string
    isOwner: boolean
    isLoading?: boolean
}

function MeetingHeader({
    title,
    meetingId,
    summary,
    actionItems,
    isOwner,
    isLoading = false
    }: MeetingHeaderProps) {
        const [isPosting, setIsPosting] = useState(false)
        const [copied, setCopied] = useState(false)
        const [isDeleting, setIsDeleting] = useState(false)
        const router = useRouter()

        const handlePostToSlack = async() => {
            if(!meetingId){
                return
            } try {
                setIsPosting(true)

                const response = await fetch('api/slack/post-meeting', {
                    method:'POST',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        meetingId: meetingId,
                        summary : summary || 'Meeting summary is not Available',
                        actionItems : actionItems || 'No Action items recorded'
                    })
                })
                const result = await response.json()

                if(response.ok){

                }else{

                }
            }catch(error){

            } finally {
                setIsPosting(false)
            }

        }
    const handleShare = async () => {
        if(!meetingId) {
            return
        }
        try{
            const shareUrl = `${window.location.origin}/meeting/${meetingId}}`
            await navigator.clipboard.writeText(shareUrl)

            setCopied(true)
            //show toast
            setTimeout(() => setCopied(false), 200);

        } catch(error){
            console.log('failed to copy', error)
        }
    }

    const handleDelete = async () => {
        if(!meetingId) {
            return
        }
        try {
          setIsDeleting(true);
          const response = await fetch(`/api/meeting/${meetingId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const result = await response.json();

          if (response.ok) {
            router.push("/home");
          } else {
          }
        } catch (error) {
          console.log("Delete Error", error);
        } finally {
            setIsDeleting(true)
        }
    }
    return (
        <div className='bg-card border-b border-border px-6 py-4 flex justify-between items-center'>
            <h1 className='text-xl font-semibold text-foreground'>
                {title}
            </h1>
            {isLoading?(
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground'></div>
                    Loading...
                </div>
            ) : isOwner?(
                <div className='flex gap-3'>
                    <Button
                        onClick={handlePostToSlack}
                        disabled={isPosting || !meetingId}
                        variant="outline"
                        className='border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer disabled:cursor-not-allowed'
                        >
                        <img
                            src="/slack.png"
                            alt="Slack"
                            className='w-4 h-4 mr-2'
                        />
                        {isPosting? 'Posting' : 'Post to Slack'}
                    </Button>

                    <Button
                    onClick={handleShare}
                    variant="outline"
                    className='flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-foreground text-sm'

                    >{copied? (
                        <>
                            <Check className='h-4 w-4'/>
                            Copied!
                        </>
                    ) : (
                        <>
                            <Share2 className='h-4 w-4'/>
                            Share
                        </>
                    )}
                    </Button>

                    <Button
                        onClick={handleDelete}
                        disabled = {isDeleting}
                        className='flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                    >
                        <Trash2 className='h-4 w-4' />
                            {isDeleting? 'Deleting...' : 'Delete'}

                    </Button>
                </div>
            ) : (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Eye className='w-4 h-4'/>
                        Viewing shared meeting
                </div>
            )}
        </div>
    )
}

export default MeetingHeader

