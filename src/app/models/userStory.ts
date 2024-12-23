export interface UserStory {
    id?: string;
    projectId: string;
    title: string;
    description: string;
    status: string;
    type: string;
    priority: string;
    storyPoints: number;
    assignedTo: string;
    createdAt: string;
}
