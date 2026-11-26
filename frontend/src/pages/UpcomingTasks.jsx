import TasksView from "../components/TasksView";

export default function UpcomingTasks() {
  return (
    <TasksView
      title="Upcoming Tasks"
      subtitle="Tasks scheduled for later"
      preset={{ due: "upcoming" }}
    />
  );
}
