export class ActivityTracker {

    constructor() {
        this.activities = [];
        this.startTime = null;
    }

    addActivity(activityType, answer_states=[], update_info=null) {
        this.activities.push(new Activity(activityType, answer_states, update_info));
    }

    getActivities() {
        return this.activities;
    }
}

export default ActivityTracker;

export class Activity {
    constructor(activityType, answer_states=[], update_info=null) {
        this.action_type = activityType;
        this.timestamp = new Date().getTime();
        this.answer_states = answer_states;
        this.update_info = update_info;
    }
}

export const ActivityType = {
    QUESTION_START: 'question_start',
    GO_LEFT: 'go_left',
    GO_RIGHT: 'go_right',
    SUBMIT_ANSWER: 'submit_answer',
    UPDATE_ANSWER: 'update_answer'
}

// button tiles
// update_answer
// submit_answer

// button for left and right
// < - left
// > - right

