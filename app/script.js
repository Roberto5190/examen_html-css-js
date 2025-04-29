const toggleThemeBtn = document.querySelector(".header_right")
const sunIcon = document.querySelector(".sun_icon")
const moonIcon = document.querySelector(".moon_icon")

toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark")


    // Guardar preferencia en localStorage (opcional)
    const isDark = document.body.classList.contains("dark")
    if (isDark) {
        moonIcon.classList.remove('hidden')
        sunIcon.classList.add('hidden')
    } else {
        sunIcon.classList.remove('hidden')
        moonIcon.classList.add('hidden')
    }
    localStorage.setItem("theme", isDark ? "dark" : "light")
})


let tasks = JSON.parse(localStorage.getItem('tasks')) || [

]


window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
        document.body.classList.add("dark")
        moonIcon.classList.remove('hidden')
        sunIcon.classList.add('hidden')
    } else {
        document.body.classList.remove("dark")
        sunIcon.classList.remove('hidden')
        moonIcon.classList.add('hidden')
    }
    showTasks()
})


// FUNCION LOCAL STORAGE
const setlocalStorage = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

let editTaskID = null

// GESTION DEL FORMULARIO
const handleForm = (e) => {
    e.preventDefault()

    const mensajeError = document.getElementById("mensaje_error");
    mensajeError.textContent = ""; // Limpiar mensajes de error anteriores

    const title = document.querySelector('.task_form_title').value.trim()
    const limitDate = document.querySelector('.task_form_date').value
    const priority = document.querySelector('.task_form_prior').value
    const id = Date.now()
    const complete = false


    if (editTaskID !== null) {
        tasks[editTaskID].title = title
        tasks[editTaskID].limitDate = limitDate
        tasks[editTaskID].priority = priority
        editTaskID = null
    } else {
        const nuevaTarea = {
            id,
            title,
            limitDate,
            priority,
            complete
        }
        tasks.push(nuevaTarea)
    }


    // VALIDACION
    if (title.length === 0) {
        mensajeError.classList.remove('hidden')
        mensajeError.textContent = "El título no puede estar vacío.";
        return;
    }

    if (!limitDate) {
        mensajeError.classList.remove('hidden')
        mensajeError.textContent = "La fecha límite es obligatoria.";
        return;
    }

    if (!priority) {
        mensajeError.classList.remove('hidden')
        mensajeError.textContent = "Debes seleccionar una prioridad.";
        return;
    }


    setlocalStorage()

    hideEditButtons()
    // RESET
    const tasksForm = document.querySelector('.task_form')
    tasksForm.reset()

    showTasks()
}

const form = document.querySelector('.task_form')
form.addEventListener('submit', handleForm)



// ELIMINAR
const eliminarTarea = (i) => {
    tasks.splice(i, 1);
    setlocalStorage()
    showTasks()
}

// EDITAR
const editarTarea = (i) => {
    const task = tasks[i]
    document.querySelector(".task_form_title").value = task.title

    document.querySelector(".task_form_date").value = task.limitDate

    document.querySelector(".task_form_prior").value = task.priority

    // guardamos que tarea estamos editando
    editTaskID = i

    const agregarButton = document.querySelector(".add_task_button")
    agregarButton.textContent = 'GUARDAR'


    const cancelButton = document.querySelector(".cancel_button")
    cancelButton.classList.remove('hidden')
    cancelButton.addEventListener('click', () => {
        cancelButton.classList.add('hidden')
        saveButton.classList.add('hidden')
        agregarButton.classList.remove('hidden')
    })
}

const hideEditButtons = () => {
    const cancelButton = document.querySelector(".cancel_button");
    cancelButton.classList.add('hidden');
}

// MOSTRAR TAREAS
const showTasks = (filterPriority = "") => {
    const tasksList = document.querySelector(".task_list_container")

    tasksList.innerHTML = ""

    // Filtrar tareas por prioridad
    const filteredTasks = filterPriority
        ? tasks.filter(task => task.priority === filterPriority) // Filtrar por prioridad seleccionada
        : tasks; // Si no hay filtro, mostrar todas las tareas

    filteredTasks.forEach((task, i) => {
        const taskCard = document.createElement('div')
        taskCard.classList.add('task_card')
        taskCard.setAttribute('draggable', 'true')

        taskCard.innerHTML += `
            <div class="title">
                <h3>${task.title}</h3>
            </div>
            <div class="limit_date">
                <h5>${task.limitDate}</h5>
            </div>

            <div class="priority">
                <h5>${task.priority}</h5>
            </div>
            <label>
            Completada
            <input type="checkbox"  class="task_complete" ${task.complete ? "checked" : ""}>
            </label>
            <div class="task_buttons">
                <button class="delete_button">Eliminar</button>
                <button class="edit_button">Editar</button>
            </div>

        `

        // Referencia al checkbox y actualizar "complete"
        const checkbox = taskCard.querySelector(".task_complete")
        checkbox.addEventListener("change", () => {
            tasks[i].complete = checkbox.checked
            setlocalStorage()
            showTasks() // opcional si quieres refrescar visualmente el estilo
        })

        const deleteButton = taskCard.querySelector(".delete_button")
        deleteButton.addEventListener('click', () => { eliminarTarea(i) })
        const editButon = taskCard.querySelector(".edit_button")
        editButon.addEventListener('click', () => editarTarea(i))


        // Event listeners for drag events
        taskCard.addEventListener('dragstart', (e) => handleDragStart(e, i))
        taskCard.addEventListener('dragover', (e) => handleDragOver(e))
        taskCard.addEventListener('drop', (e) => handleDrop(e, i))

        tasksList.appendChild(taskCard)
    })
}



// FILTRAR POR PRIORIDAD
// Filtrar tareas por prioridad
const filterSelect = document.querySelector('.filter_tasks')
filterSelect.addEventListener('change', (e) => {
    const selectedPriority = e.target.value
    showTasks(selectedPriority)  // Filtrar las tareas según la prioridad seleccionada
})


// DRAG & DROP

// Manejar el inicio del arrastre (dragstart)
let draggedTaskIndex = null
const handleDragStart = (e, i) => {
    draggedTaskIndex = i
    e.dataTransfer.effectAllowed = 'move'  // Establecer el tipo de acción permitido
}

// Manejar el arrastre sobre el área (dragover)
const handleDragOver = (e) => {
    e.preventDefault()  // Necesario para que se pueda hacer el "drop"
}

// Manejar el "drop" (soltar el elemento)
const handleDrop = (e, targetIndex) => {
    e.preventDefault()

    // Si el índice de la tarea arrastrada es el mismo que el objetivo, no hacer nada
    if (draggedTaskIndex === targetIndex) return

    // Mover la tarea en el arreglo
    const [draggedTask] = tasks.splice(draggedTaskIndex, 1)  // Eliminar la tarea arrastrada
    tasks.splice(targetIndex, 0, draggedTask)  // Insertar la tarea en la nueva posición

    // Guardar los cambios en el Local Storage
    setlocalStorage()

    // Volver a renderizar las tareas con el nuevo orden
    showTasks()
}