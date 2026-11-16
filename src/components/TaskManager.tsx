"use client";

import { memo, useMemo, useState, type FormEvent } from "react";
import { Plus, ListChecks, Search, SlidersHorizontal } from "lucide-react";
import type { Category, Priority, Task, TaskFilter, TaskSort } from "@/types";
import { TaskCard } from "@/components/TaskCard";

interface TaskManagerProps {
  tasks: Task[];
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  onAdd: (title: string, priority: Priority, category: Category, dueDate: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Pick<Task, "title" | "priority" | "category" | "dueDate">) => void;
  getVisibleTasks: (search: string, category: Category | "all", sort: TaskSort) => Task[];
}

const filters: { label: string; value: TaskFilter }[] = [
  { label: "Todas", value: "all" }, { label: "Pendentes", value: "pending" }, { label: "Concluídas", value: "done" }
];

function TaskManagerView(props: TaskManagerProps) {
  const getVisibleTasks = props.getVisibleTasks;
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("other");
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [sort, setSort] = useState<TaskSort>("newest");
  const visibleTasks = useMemo(
    () => getVisibleTasks(search, categoryFilter, sort),
    [getVisibleTasks, search, categoryFilter, sort]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    props.onAdd(title, priority, category, dueDate);
    setTitle(""); setPriority("medium"); setCategory("other"); setDueDate("");
  }

  return (
    <section className="panel task-panel" id="missions">
      <div className="panel-heading"><div className="heading-title"><ListChecks size={17}/><h2>CENTRAL DE MISSÕES</h2></div><span className="micro-label">{visibleTasks.length} DE {props.tasks.length} MISSÕES</span></div>
      <form className="task-form task-form-advanced" onSubmit={handleSubmit}>
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={90} placeholder="O que precisa ser feito?" aria-label="Nome da missão" required />
        <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)} aria-label="Prioridade">
          <option value="high">Alta prioridade</option><option value="medium">Média prioridade</option><option value="low">Baixa prioridade</option>
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value as Category)} aria-label="Categoria">
          <option value="work">Trabalho</option><option value="study">Estudo</option><option value="personal">Pessoal</option><option value="other">Outra</option>
        </select>
        <input className="date-input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Prazo da missão" />
        <button className="primary-button" type="submit"><Plus size={16}/> ADICIONAR</button>
      </form>
      <div className="task-tools">
        <label className="task-search"><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar missão..." aria-label="Buscar missão"/><span className="search-shortcut">⌕</span></label>
        <label className="task-select"><SlidersHorizontal size={14}/><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as Category | "all")} aria-label="Filtrar por categoria"><option value="all">Todas categorias</option><option value="work">Trabalho</option><option value="study">Estudo</option><option value="personal">Pessoal</option><option value="other">Outra</option></select></label>
        <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value as TaskSort)} aria-label="Ordenar missões"><option value="newest">Mais recentes</option><option value="oldest">Mais antigas</option><option value="priority">Prioridade</option><option value="dueDate">Prazo</option></select>
      </div>
      <div className="filter-row" role="group" aria-label="Filtrar status das missões">
        {filters.map((item) => <button type="button" key={item.value} className={`filter-button ${props.filter === item.value ? "active" : ""}`} onClick={() => props.onFilterChange(item.value)}>{item.label}</button>)}
      </div>
      <div className="task-list" aria-live="polite">
        {visibleTasks.length ? visibleTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={props.onToggle} onDelete={props.onDelete} onUpdate={props.onUpdate}/>) : (
          <div className="empty-state"><ListChecks size={25}/><strong>{search ? "Nenhuma missão encontrada" : "Nenhuma missão por aqui"}</strong><span>{search ? "Tente outro termo de busca." : "Adicione uma missão ou escolha outro filtro."}</span></div>
        )}
      </div>
    </section>
  );
}

export const TaskManager = memo(TaskManagerView);
