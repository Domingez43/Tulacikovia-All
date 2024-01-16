export interface NoticeModel<T> {
    title: string,
    message: string,
    icon: any,
    route: string,
    subject?: {
        type: string;
        object: T;
    }
  }
  
export class Notice<T> implements NoticeModel<T> {
    title!: string;
    message!: string;
    icon!: any;
    route!: string;
    subject?: {
        type: string;
        object: T;
    }

    constructor(title: string, message: string, icon: any, route: string, subjectType?: string, subject?: T) {
        this.title = title;
        this.message = message;
        this.icon = icon;
        this.route = route;
        this.subject = (subject && subjectType) ? {
            type: subjectType,
            object: subject
        } : undefined;
    }
}