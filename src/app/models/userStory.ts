export interface UserStory {
    id?: string;
    projectId: string;
    title: string;
    description: string;
    status: string;
    type: string;
    storyPoints: number;
    assignedTo: string;
    createdAt: string;
}
