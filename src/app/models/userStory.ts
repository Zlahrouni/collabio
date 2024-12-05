export interface UserStory {
    id: number;
    title: string;
    description: string;
    status: 'Not started' | 'Pending' | 'Finish';
    type: 'Fonctionnalité' | 'Amélioration' | 'Correction de bug';
    storyPoints: number;
    assignedTo: string;
    createdAt: string;
}
