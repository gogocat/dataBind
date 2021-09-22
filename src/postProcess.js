import {
    each,
    throwErrorMessage,
} from './util';

export default function postProcess(tasks) {
    if (!tasks || !tasks.length) {
        return;
    }

    each(tasks, (index, task) => {
        if (typeof task === 'function') {
            try {
                task();
            } catch (err) {
                throwErrorMessage(err, 'Error postProcess: ' + String(task));
            }
        }
    });
}
