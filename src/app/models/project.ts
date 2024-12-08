import {User} from "./user";

export class Project {
    id?: string;
    name?: string;
    description?: string;
    status?: string;
    users?: string[];
    createdBy?: string;
    budget?: number;
    tasks?: string[];
    Date?: Date;
}
