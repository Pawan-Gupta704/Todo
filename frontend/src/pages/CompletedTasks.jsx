import TasksView from "../components/TasksView";

export default function CompletedTasks() {
  return (
    <TasksView
      title="Completed Tasks"
      subtitle="Everything you've finished"
      preset={{ status: "completed" }}
    />
  );
}
