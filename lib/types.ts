export interface ActionItem {
    id: number;
    text: string;
}

export interface MeetingActionItems {
    actionItems?: ActionItem[] | null;
}
