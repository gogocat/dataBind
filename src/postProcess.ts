import {
    each,
    throwErrorMessage,
} from './util';

const postProcess = (tasks: Function[]): void => {
    if (!tasks || !tasks.length) {
        return;
    }

    each(tasks, (index: number, task: Function) => {
        if (typeof task === 'function') {
            try {
                task();
            } catch (err) {
                throwErrorMessage(err, `Error postProcess: ${  String(task)}`);
            }
        }
    });
};

export default postProcess;
