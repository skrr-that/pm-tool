"use client"

import { useEffect, useState } from "react"

export default function Home() {
  // ---------------- 상태 ----------------
  const [procedures, setProcedures] = useState<any[]>([])
  const [tasks, setTasks] = useState<Record<string, any[]>>({})
  const [procedureTitle, setProcedureTitle] = useState("")
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({})

  // 1번 기능
  const [ideas, setIdeas] = useState<string[]>([])
  const [newIdea, setNewIdea] = useState("")
  const [selectedIdea, setSelectedIdea] = useState<string>("")

  const projectId = "11111111-1111-1111-1111-111111111111"

  // ---------------- 1번 기능 ----------------

  const addIdea = () => {
    if (!newIdea.trim()) return
    setIdeas((prev) => [...prev, newIdea])
    setNewIdea("")
  }

  const selectIdea = (idea: string) => {
    setSelectedIdea(idea)
  }

  // ---------------- 절차 ----------------

  const fetchProcedures = async () => {
    try {
      const res = await fetch(`/api/procedures?project_id=${projectId}`)
      if (!res.ok) return
      const result = await res.json()
      setProcedures(result.data || [])
      result.data?.forEach((proc: any) => fetchTasks(proc.id))
    } catch (err) {
      console.log("fetchProcedures error:", err)
    }
  }

  const addProcedure = async () => {
    if (!procedureTitle.trim()) return

    await fetch("/api/procedures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, title: procedureTitle }),
    })

    setProcedureTitle("")
    fetchProcedures()
  }

  const deleteProcedure = async (id: string) => {
    await fetch("/api/procedures", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, project_id: projectId }),
    })

    fetchProcedures()
  }

  // ---------------- 작업 ----------------

  const fetchTasks = async (procedure_id: string) => {
    try {
      const res = await fetch(`/api/tasks?procedure_id=${procedure_id}`)
      if (!res.ok) {
        setTasks((prev) => ({ ...(prev || {}), [procedure_id]: [] }))
        return
      }
      const result = await res.json()
      setTasks((prev) => ({
        ...(prev || {}),
        [procedure_id]: result?.data || [],
      }))
    } catch {
      setTasks((prev) => ({ ...(prev || {}), [procedure_id]: [] }))
    }
  }

  const addTask = async (procedure_id: string) => {
    const title = taskInputs[procedure_id]
    if (!title?.trim()) return

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ procedure_id, title }),
    })

    setTaskInputs((prev) => ({ ...prev, [procedure_id]: "" }))
    fetchTasks(procedure_id)
  }

  useEffect(() => {
    fetchProcedures()
  }, [])

  // ---------------- UI ----------------

  return (
    <div style={{ padding: 40 }}>
      <h1>PM Tool MVP</h1>

      {/* 1번 기능 */}
      <h2>프로젝트 목표 설정</h2>

      <input
        placeholder="아이디어 입력"
        value={newIdea}
        onChange={(e) => setNewIdea(e.target.value)}
      />
      <button onClick={addIdea}>추가</button>

      <ul>
        {ideas.map((idea, idx) => (
          <li key={idx}>
            {idea} <button onClick={() => selectIdea(idea)}> 선택</button>
          </li>
        ))}
      </ul>

      {selectedIdea && (
        <p>
          <strong>선택된 목표:</strong> {selectedIdea}
        </p>
      )}

      <hr style={{ margin: "40px 0" }} />

      {/* 절차 */}
      <input
        placeholder="절차 제목"
        value={procedureTitle}
        onChange={(e) => setProcedureTitle(e.target.value)}
      />
      <button onClick={addProcedure}> 추가</button>

      {procedures.map((proc) => (
        <div key={proc.id} style={{ marginBottom: 30 }}>
          <h3>
            {proc.title}
            <button onClick={() => deleteProcedure(proc.id)}> 삭제</button>
          </h3>

          <input
            placeholder="작업 제목"
            value={taskInputs[proc.id] || ""}
            onChange={(e) =>
              setTaskInputs((prev) => ({
                ...prev,
                [proc.id]: e.target.value,
              }))
            }
          />

          <button onClick={() => addTask(proc.id)}>작업 추가</button>

          <ul>
            {(tasks[proc.id] || []).map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
