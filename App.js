import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const addTask = () => {
    if (task.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          text: task,
          completed: false,
          opacity: new Animated.Value(1),
        },
      ]);
      setTask("");
    }
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find((item) => item.id === taskId);
    if (taskToDelete) {
      Animated.timing(taskToDelete.opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setTasks(tasks.filter((item) => item.id !== taskId));
      });
    }
  };

  const confirmDelete = (taskId) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTask(taskId),
        },
      ],
      { cancelable: true }
    );
  };

  const toggleTask = (taskId) => {
    setTasks(
      tasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsEditModalVisible(true);
  };

  const saveEdit = (newName) => {
    if (editingTask && newName.trim()) {
      setTasks(
        tasks.map((item) =>
          item.id === editingTask.id ? { ...item, text: newName } : item
        )
      );
    }
    closeEditModal();
  };

  const closeEditModal = () => {
    setEditingTask(null);
    setIsEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mouli's To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Icon name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View
            style={[styles.taskContainer, { opacity: item.opacity }]}
          >
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
              <View
                style={[
                  styles.radioButton,
                  item.completed && styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.taskText,
                item.completed && styles.taskTextCompleted,
              ]}
            >
              {item.text}
            </Text>
            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Icon name="edit" size={20} color="#5C5CFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                <Icon name="delete" size={20} color="#FF5C5C" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
      {isEditModalVisible && (
        <Modal
          transparent
          animationType="slide"
          visible={isEditModalVisible}
          onRequestClose={closeEditModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              <TextInput
                style={styles.modalInput}
                defaultValue={editingTask.text}
                onChangeText={(text) =>
                  setEditingTask({ ...editingTask, text })
                }
              />
              <View style={styles.modalActions}>
                <Button
                  title="Save"
                  onPress={() => saveEdit(editingTask.text)}
                />
                <Button title="Close" onPress={closeEditModal} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "#5C5CFF",
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginLeft: 10,
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  taskText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginLeft: 10,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  iconContainer: {
    flexDirection: "row",
    gap: 10,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    backgroundColor: "#5C5CFF",
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
