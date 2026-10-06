import { describe, expect, mock, test } from "bun:test";
import { createAiTools } from "@ai-friendly/command";
import type { Task } from "../tasks/tasks";
import { createTasksCommands } from "./tasks-commands";

const sample: Task[] = [
  { id: "1", title: "a", done: true },
  { id: "2", title: "b", done: false },
];

const setup = ({
  tasks = sample,
  confirm,
}: {
  tasks?: Task[];
  confirm?: () => Promise<boolean>;
} = {}) => {
  const actions = {
    addTask: mock((_: string) => {}),
    setTaskDone: mock((_: string, __: boolean) => {}),
    deleteTask: mock((_: string) => {}),
  };
  const confirmMock = mock(confirm ?? (async () => true));
  const tools = createAiTools({
    commands: createTasksCommands({ tasks, ...actions }),
    confirm: confirmMock,
  });
  const run = (name: string, input: unknown) =>
    tools.find((t) => t.name === name)?.execute(input);
  return { ...actions, confirm: confirmMock, run };
};

describe("tasks commands", () => {
  test("call the site's functions", async () => {
    const s = setup();
    expect(await s.run("add_task", { title: "c" })).toEqual({ ok: true });
    expect(await s.run("set_task_done", { id: "2", done: true })).toEqual({
      ok: true,
    });
    expect(s.addTask).toHaveBeenCalledWith("c");
    expect(s.setTaskDone).toHaveBeenCalledWith("2", true);
  });

  test("reject an empty title", async () => {
    expect(await setup().run("add_task", { title: "  " })).toMatchObject({
      ok: false,
      code: "invalid_command",
    });
  });

  test("tell the existing ids for an unknown id", async () => {
    const s = setup();
    expect(await s.run("set_task_done", { id: "9", done: true })).toEqual({
      ok: false,
      code: "domain_error",
      message: 'set_task_done: task "9" not found (ids: 1, 2)',
    });
    expect(s.setTaskDone).not.toHaveBeenCalled();
  });

  test("delete only after confirmation", async () => {
    const approved = setup();
    expect(await approved.run("delete_task", { id: "1" })).toEqual({
      ok: true,
    });
    expect(approved.deleteTask).toHaveBeenCalledWith("1");

    const declined = setup({ confirm: async () => false });
    expect(await declined.run("delete_task", { id: "1" })).toMatchObject({
      ok: false,
      code: "rejected",
    });
    expect(declined.deleteTask).not.toHaveBeenCalled();
  });

  test("clear the completed ones after confirmation", async () => {
    const s = setup();
    expect(await s.run("clear_completed", {})).toEqual({ ok: true });
    expect(s.confirm).toHaveBeenCalledTimes(1);
    expect(s.deleteTask.mock.calls).toEqual([["1"]]);
  });

  test("tell without asking when nothing is completed", async () => {
    const s = setup({ tasks: [{ id: "2", title: "b", done: false }] });
    expect(await s.run("clear_completed", {})).toEqual({
      ok: false,
      code: "domain_error",
      message: "clear_completed: there are no completed tasks",
    });
    expect(s.confirm).not.toHaveBeenCalled();
  });
});
