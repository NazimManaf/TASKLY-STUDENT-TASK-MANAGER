package main

import "fmt"

type Task struct {
	Title     string
	Completed bool
}

func countTasks(tasks []Task) (int, int) {
	stats := map[string]int{
		"completed": 0,
		"pending":   0,
	}

	for _, task := range tasks {
		if task.Completed {
			stats["completed"]++
		} else {
			stats["pending"]++
		}
	}

	return stats["completed"], stats["pending"]
}

func main() {
	studentName := "Sam"        // string
	weekNumber := 3             // int
	studyHours := 2.5            // float64
	isStudying := true           // bool
	moduleNames := [2]string{"Web Development", "Go Basics"} // array

	tasks := []Task{
		{Title: "Review lecture notes", Completed: true},
		{Title: "Build the task form", Completed: false},
		{Title: "Read about MongoDB", Completed: true},
		{Title: "Practice Go slices", Completed: false},
	}

	completed, pending := countTasks(tasks)
	fmt.Printf("Student: %s | Week: %d | Study hours: %.1f | Studying: %t\n",
		studentName, weekNumber, studyHours, isStudying)
	fmt.Printf("Modules: %v\n", moduleNames)
	fmt.Printf("Task stats — total: %d, completed: %d, pending: %d\n",
		len(tasks), completed, pending)

	for index, task := range tasks {
		status := "pending"
		if task.Completed {
			status = "completed"
		}
		fmt.Printf("%d. %-24s [%s]\n", index+1, task.Title, status)
	}
}
