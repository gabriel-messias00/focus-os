"use client";

import { memo, useState, type FormEvent } from "react";
import { Check, Pencil, RotateCcw, Save, Trash2, X } from "lucide-react";
import type { Category, Priority, Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Pick<Task, "title" | "priority" | "category" | "dueDate">) => void;
}

const priorityLabel: Record<Priority, string> = { high: "ALTA", medium: "MÉDIA", low: "BAIXA" };
const categoryLabel: Record<Category, string> = { work: "TRABALHO", study: "ESTUDO", personal: "PESSOAL", other: "OUTRA" };

function TaskCardView({ task, onToggle, onDelete, onUpdate }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [category, setCategory] = useState<Category>(task.category || "other");
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onUpdate(task.id, { title, priority, category, dueDate });
    setEditing(false);
  }

  function cancel() {
    setTitle(task.title); setPriority(task.priority); setCategory(task.category || "other");
    setDueDate(task.dueDate || ""); setEditing(false);
  }

  if (editing) return (
    <form className="task-edit-form" onSubmit={save}>
      <input className="edit-title-input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={90} aria-label="Título da missão" required />
      <div className="edit-fields">
        <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)} aria-label="Prioridade">
          <option value="high">Alta prioridade</option><option value="medium">Média prioridade</option><option value="low">Baixa prioridade</option>
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value as Category)} aria-label="Categoria">
          <option value="work">Trabalho</option><option value="study">Estudo</option><option value="personal">Pessoal</option><option value="other">Outra</option>
        </select>
        <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Prazo" />
      </div>
      <div className="edit-actions"><button className="primary-button" type="submit"><Save size={14}/> SALVAR</button><button className="secondary-button" type="button" onClick={cancel}><X size={14}/> CANCELAR</button></div>
    </form>
  );

  const localToday = (() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
  })();
  const overdue = task.dueDate && !task.done && task.dueDate < localToday;
  return (
    <article className={`task-card ${task.done ? "is-done" : ""}`}>
      <button type="button" className={`task-check ${task.done ? "checked" : ""}`} onClick={() => onToggle(task.id)} aria-label={task.done ? "Marcar como pendente" : "Marcar como concluída"} title={task.done ? "Reabrir missão" : "Concluir missão"}>
        {task.done ? <Check size={15} /> : null}
      </button>
      <div className="task-content">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          <span className={`priority-dot ${task.priority}`} />{priorityLabel[task.priority]}
          <span className="meta-separator">·</span>{categoryLabel[task.category || "other"]}
          {task.dueDate && <><span className="meta-separator">·</span><span className={overdue ? "due-overdue" : ""}>{overdue ? "ATRASADA · " : "PRAZO · "}{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString("pt-BR")}</span></>}
        </div>
      </div>
      <button type="button" className="task-action complete-action" onClick={() => onToggle(task.id)}>{task.done ? <><RotateCcw size={13}/> REABRIR</> : <><Check size={13}/> CONCLUIR</>}</button>
      <button type="button" className="icon-button" onClick={() => { setTitle(task.title); setPriority(task.priority); setCategory(task.category || "other"); setDueDate(task.dueDate || ""); setEditing(true); }} aria-label="Editar missão" title="Editar missão"><Pencil size={15}/></button>
      {confirmingDelete ? (
        <div className="delete-confirm-inline" role="group" aria-label={`Confirmar exclusão de ${task.title}`}>
          <span>Excluir?</span>
          <button type="button" className="delete-confirm-yes" onClick={() => onDelete(task.id)}>SIM</button>
          <button type="button" className="delete-confirm-no" onClick={() => setConfirmingDelete(false)}>NÃO</button>
        </div>
      ) : (
        <button type="button" className="icon-button delete-button" onClick={() => setConfirmingDelete(true)} aria-label={`Excluir missão: ${task.title}`} title="Excluir missão"><Trash2 size={16}/></button>
      )}
    </article>
  );
}

export const TaskCard = memo(TaskCardView);
