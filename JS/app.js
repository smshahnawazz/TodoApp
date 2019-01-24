/* Playing with Service Worker */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(function () {
            console.log('[Service Worker] - Service worker registed.');
        })
        .catch(function () {
            console.log("[Service Worker] - failed to register service worker.");
        });
}

/* indexDB variables */
let request, store, db, tx;
/* Variable to get the key to update value (Required for updating the data) */
let flagForUpdate;

/* main-page Elements */
let taskField = document.getElementById('task');
let addBtn = document.getElementById('addTask');
let updateBtn = document.getElementById('updateTask');
let taskList = document.getElementById('userTask');
updateBtn.disabled = true;

/* checking empty field */
function checkField() {
    if (taskField.value != "") {
        addTask();
    }
    else {
        alert("Please enter the task.");
    }
}
/* function to add new task in indexDB */

function addTask() {
    request = window.indexedDB.open("tasksDatabase", 1);
    request.onupgradeneeded = function () {
        db = request.result;
        store = db.createObjectStore("tasks", { autoIncrement: true });
    }

    request.onsuccess = function () {
        db = request.result;
        tx = db.transaction("tasks", "readwrite");
        store = tx.objectStore("tasks");
        let t = store.add(taskField.value);
        t.onsuccess = function () {
            readTask();
            clearFieldAndFocus();

            console.log("Task has been added successfully.");
        }
        t.onerror = function () {
            console.log("Task add failed.");
            clearFieldAndFocus();
            alert("Task addition has been failed due to some reason.");
        }
        tx.oncomplete = function () {
            db.close();
            console.log("[Writing] - Transaction completed.");
        }
    }
    request.onerror = function () {
        console.log("indexDB request has been failed.");
        clearFieldAndFocus();
    }
}

/* function to edit task */

function editTask(key) {
    updateBtn.disabled = false;
    flagForUpdate = key;
    request = window.indexedDB.open('tasksDatabase', 1);
    request.onsuccess = function () {
        db = request.result;
        tx = db.transaction("tasks");
        store = tx.objectStore("tasks");
        let taskData = store.get(key);
        taskData.onsuccess = function () {
            taskField.value = taskData.result;
        }
        taskField.onerror = function () {
            console.log("Unable to fetch data from indexDB due to some reason.");
            alert("Edit Failed. Unable to fetch data from indexDB.");
        }
        tx.oncomplete = function () {
            console.log("Reading data for Editing - Transaction complete.");
            db.close();
        }
    }
}

/* function to update task */
function updateTask() {
    request = window.indexedDB.open("tasksDatabase", 1);
    request.onsuccess = function () {
        db = request.result;
        tx = db.transaction("tasks", "readwrite");
        store = tx.objectStore("tasks");
        if (taskField.value != "") {
            let taskData = store.put(taskField.value, flagForUpdate);
            taskData.onsuccess = function () {
                console.log("Task update successful.");
                readTask();
                clearFieldAndFocus();
            }
            taskData.onerror = function () {
                alert("Update unsuccessful due to some reason.");
                console.log("Update unsucessful.");
                clearFieldAndFocus();
            }

        }
        else {
            alert("Please enter the task.");
        }
        tx.oncomplete = function () {
            console.log("Update Task - Transaction complete.");
            db.close();
        }
    }
    updateBtn.disabled = true;
}
/* function to delete task */

function deleteTask(key) {
    request = window.indexedDB.open("tasksDatabase", 1);
    request.onsuccess = function () {
        db = request.result;
        tx = db.transaction("tasks", "readwrite");
        store = tx.objectStore("tasks");
        let deleteRequest = store.delete(key);
        deleteRequest.onsuccess = function () {
            readTask();
            console.log("Task " + key + "has been deleted.");
        }
        deleteRequest.onerror = function () {
            alert("Failed to delete the task due to some reason.");
            console.log("Failed to delete the task.");
        }
        tx.oncomplete = function () {
            console.log("Task delete - Transaction complete.");
            db.close();
        }
    }
}

/* function to read data from indexDB */

function readTask() {
    request = window.indexedDB.open("tasksDatabase", 1);
    request.onupgradeneeded = function () {
        db = request.result;
        store = db.createObjectStore("tasks", { autoIncrement: true });
    }
    request.onsuccess = function () {
        db = request.result;
        if (db.objectStoreNames[0] === "tasks") {
            tx = db.transaction("tasks");
            store = tx.objectStore("tasks");
            let taskObjects = store.getAll();
            taskObjects.onsuccess = function () {
                let taskKeys = store.getAllKeys();
                taskKeys.onsuccess = function () {
                    let i;
                    taskList.innerHTML = "";
                    for (i = 0; i < taskKeys.result.length; i++) {
                        let taskData = taskObjects.result[i];
                        let taskKey = taskKeys.result[i];
                        taskList.innerHTML += `
                    <tr> 
                        <td>${taskKey} </td>
                        <td> ${taskData} </td>
                        <td> <button type='button' class="btn btn-warning btn-block" onclick='editTask(${taskKey})'>Edit </button> </td>
                        <td> <button type='button' class="btn btn-danger btn-block" onclick = 'deleteTask(${taskKey})'>Delete </button> </td>
                    </tr>
                    `;
                    }
                };
            };

            tx.oncomplete = function () {
                db.close();
                console.log("[Reading] - Transaction completed.");
            };
        }
        else {
            console.log("unable to fetch data because store not found.");
        }
    };
}


/* function to clear text field and setting focus on the text field */

function clearFieldAndFocus() {
    taskField.value = "";
    taskField.focus();
}


/* setting methods */
addBtn.addEventListener("click", checkField);
updateBtn.addEventListener("click", updateTask);