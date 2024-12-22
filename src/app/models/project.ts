export interface Project {
    id?: string;
    name: string;
    description: string;
    users: string[];
    createdBy: string;
    budget: number;
    createdAt: Date;
}
