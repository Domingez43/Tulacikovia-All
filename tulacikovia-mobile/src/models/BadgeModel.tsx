export interface BadgeModel {
    name: string,
    title: string,
    subject: string,
    target: number,
    progress: number,
    badge: any,
    handler: string,
}

export class Badge implements BadgeModel {
    name!: string;
    title!: string;
    subject!: string;
    target!: number;
    progress!: number;
    badge!: any;
    handler: string;

    constructor(name: string, title: string, subject: string, target: number, progress: number, badge: any, handler: string) {
        this.name = name;
        this.title = title;
        this.subject = subject;
        this.target = target;
        this.progress = progress;
        this.badge = badge;
        this.handler = handler;
    }
}