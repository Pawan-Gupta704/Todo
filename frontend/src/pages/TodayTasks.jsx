import TasksView from "../components/TasksView";

export default function TodayTasks() {
  return (
    <TasksView
      title="Today's Tasks"
      subtitle="Everything due today"
      preset={{ due: "today" }}
    />
  );
}
