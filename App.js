import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { theme } from './colors';

const STORAGE_KEY_TODOS = "@toDos";
const STORAGE_KEY_LOCATION = "@location";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState();
  const [toDos, setToDos] = useState({});
  const travel = () => {
    setWorking(false);
  }
  const work = () => {
    setWorking(true);
  }
  const loadLocation = async () => {
    const location = await AsyncStorage.getItem(STORAGE_KEY_LOCATION);
    setWorking(location === "work" ? true : false);
  }
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(toSave))
    } catch (error) {
      // saving error
      console.log(error);
    }
  }
  const loadToDos = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_TODOS);
      setToDos(JSON.parse(jsonValue));
    } catch (error) {
      // load error
      console.log(error);
    }
  }
  useEffect(() => {
    loadLocation();
    loadToDos();
  }, []);
  useEffect(() => {
    working 
    ? AsyncStorage.setItem(STORAGE_KEY_LOCATION, "work")
    : AsyncStorage.setItem(STORAGE_KEY_LOCATION, "travel");
  }, [working]);
  const addToDo = async () => {
    if(text === "") {
      return
    }
    // const newToDos = Object.assign(
    //   {}, 
    //   toDos, 
    //   {[Date.now()]: {text, work:working}}
    // );
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, done: false }
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  }
  const deleteToDo = async (key) => {
    Alert.alert(
      "항목 삭제", 
      "항목을 삭제하시겠습니까?", 
      [
        { text: "취소",},
        { text: "삭제",
          onPress: async () => {
            const newToDos = {...toDos};
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          }
        }
      ]
    );
    return;
  }
  const toggleToDoState = async (key) => {
    const newToDos = {...toDos};
    newToDos[key].done = !newToDos[key].done;
    setToDos(newToDos);
    await saveToDos(newToDos);
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? '#fff' : theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? '#fff' : theme.grey}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput 
          onSubmitEditing={addToDo}
          onChangeText={onChangeText} 
          value={text} 
          returnKeyType="done"
          placeholder={working ? '할 일을 추가하세요' : '어디에 가고 싶은가요?'} style={styles.input} 
        />
      </View>
      <ScrollView>
        {
          Object.keys(toDos).map(key => (
            toDos[key].working === working ? 
            <View style={styles.toDo} key={key}>
              <TouchableOpacity onPress={() => toggleToDoState(key)} style={styles.toDoTextContainer}>
                {
                  toDos[key].done 
                  ? (<>
                      <Feather name="check-circle" size={16} color="#fff" />
                      <Text style={{...styles.toDoText, textDecorationLine: "line-through"}}>{toDos[key].text}</Text>
                    </>)
                  : (<>
                      <Feather name="circle" size={16} color="#fff" />
                      <Text style={styles.toDoText}>{toDos[key].text}</Text>
                    </>)
                }
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Feather name="trash-2" size={16} color={theme.grey} />
              </TouchableOpacity>
            </View>
            : null
          ))
        }
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    fontSize: 36,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 16,
    marginBottom: 32,
    fontSize: 16,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toDoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toDoText: {
    color: '#fff',
    fontSize: 16,
    paddingLeft: 8,
  }
});
