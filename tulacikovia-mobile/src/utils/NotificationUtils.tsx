import { Toast } from "react-native-popup-confirm-toast";

export class NotificationUtils {

    private notificationShown = false;

    showMessage(title: string, text: string, type: "SUCCESS" | "ERROR") {
        if(this.notificationShown) return;

        Toast.show({
            title: title,
            text: text + "\n",
            backgroundColor: (type == "SUCCESS") ? '#34c759' : '#ff3a30',
            timeColor: (type == "SUCCESS") ? '#16782e' : '#b02019',
            timing: 3000,
            position: 'top',
            statusBarType:'dark-content',
            onCloseComplete: () => { this.notificationShown = false },
            onOpenComplete: () => { this.notificationShown = true },
        })
    }

}

export const Notifications = new NotificationUtils();