const { db } = require("./src/firebase");
const { doc, setDoc } = require("firebase/firestore");

async function testFirestore() {
  try {
    console.log("Проверка подключения к Firestore...");
    await setDoc(doc(db, "test", "testDoc"), { testField: "testValue" });
    console.log("Данные успешно сохранены в Firestore!");
  } catch (error) {
    console.error("Ошибка подключения к Firestore:", error);
  }
}

testFirestore();