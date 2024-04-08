<script setup>
import inputToken from '../components/inputToken.vue'
import Loading from '../components/Loading.vue'
import ImageRecognition from '../components/ImageRecognition.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
</script>

<template>
  <ErrorMessage v-if="errorStatus != null" :errorStatus="errorStatus" v-model:errorStatus="errorStatus"/>
  <RouterLink :to="{ name: 'home' }" class="back-button">&lt;</RouterLink>
  <div class="chat-page" :class="{ disabled: disabled }">
    <div class="main-content">
      <div ref="container" class="conversation">
        <ImageRecognition v-if="isAuth === true" :messages="messages" :progress="progress"/>
        <inputToken v-else-if="isAuth !== true" v-model:isAuth="isAuth" v-model:disabled="disabled"/>
        <Loading v-else />
      </div>
      <div class="input-area">
        <div class="progress-container" v-if="progress">
            <p class="progress-bar">
                <span class="progress" :style="{ width: progress + '%' }"></span><br>
            </p>
            {{ progress + '%' }}
        </div>
        <div class="button-group">
            <input class="input-field" type="file" ref="fileInput" :disabled="disabled" @change="handleFileChange">
            <button class="send-button" title="Отправить" :disabled="disabled" @click="sendData()">&rsaquo;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CheckToken from '../components/CheckToken.vue'
import axios from 'axios'

export default {
  data() {
    return {
      isAuth: Boolean,
      disabled: true,
      file: '',
      messages: [],
      errorStatus: null,
      progress: null
    }
  },

  watch: {
    isAuth(newIsAuth) {
      if (newIsAuth === true) {
        this.viewMessages()
        this.disabled = false
      } else {
        this.errorStatus = newIsAuth
      }
    }
  },

  async mounted() {
    try {
      this.isAuth = await CheckToken()
      this.disabled = !this.isAuth
    } catch (error) {
      console.error('Error checking authentication:', error)
    }

    try {
      const getMessages = this.getMessagesForStorage()
      if (this.isAuth && getMessages) {
        this.messages = getMessages
        setTimeout(this.scrollToBottom, 150)
      }
    } catch (error) {
      console.error('Error get messages:', error)
    }
  },

  updated() {
    this.scrollToBottom();
  },

  methods: {
    async sendData() {
      if (!this.file) {
        console.error('No file selected.');
        return;
      }

      this.disabled = true;

      const formData = new FormData();
      formData.append('image', this.file);

      this.isAuth = await CheckToken()

      await axios.post(
        'http://127.0.0.1:3000/api/imagerecognition/recognize',
        formData,
        {
          headers: {
            'X-API-TOKEN': this.getStorageToken(),
            'Content-Type': 'multipart/form-data'
          }
        }
      ).then(response => {
        this.progressBar()

        setTimeout(() => {
            this.progress = null
            this.messages.push({ req: this.imageDataUrl, res: response.data.objects })
            this.setMessagesToStorage(this.messages)
            this.disabled = false
        }, 500)
      })
      .catch(error => {
        this.errorStatus = error.response.status
      })
    },

    handleFileChange(event) {
      this.file = event.target.files[0];

      const reader = new FileReader();

      reader.onload = (e) => {
        this.imageDataUrl = e.target.result;
      };

      reader.readAsDataURL(this.file);
    },

    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.container.scrollTop = this.$refs.container.scrollHeight;
      });
    },

    progressBar() {
      for (let i = 0; i < 100; i++) {
        setTimeout(() => {
          this.progress++
        }, i * 5)
      }
    },

    clearInput() {
      this.prompt = ''
    },

    getStorageToken() {
      return localStorage.getItem('API-TOKEN')
    },

    getMessagesForStorage() {
      return JSON.parse(localStorage.getItem('image-recognition')) || false
    },

    setMessagesToStorage(data) {
      const images = this.getMessagesForStorage()
      let newData = [...data]

      if (images && images.length >= 3) {
        newData = newData.slice(-3)
      }

      localStorage.setItem('image-recognition', JSON.stringify(newData))
    }
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100vh; /* Задаем минимальную высоту нашей странице, чтобы она занимала всю видимую область */
}

.chat-page.disabled .new-chat-button,
.chat-page.disabled .chat-list li,
.chat-page.disabled .input-area input,
.chat-page.disabled .input-area button {
  cursor: no-drop !important;
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column; /* Располагаем элементы в столбец */
  justify-content: space-between; /* Распределяем элементы по вертикали равномерно */
  padding: 20px;
}

.back-button {
  position: fixed;
  top: 10px;
  left: 10px;
  text-decoration: none;
  width: 50px;
  text-align: center;
  font-size: 18px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #414141;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.conversation {
  scroll-behavior: smooth;
  flex-grow: 1; /* Этот блок будет растягиваться по высоте на всю доступную область */
  overflow-y: auto; /* Включаем вертикальный скроллинг, если контент переполняет блок */
}

.input-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0 0 0;
}

.progress-container {
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
}

.progress-bar {
    margin-bottom: 5px;
    width: 100%;
    height: 1em;
    background-color: white; 
    border: 1px solid black;
    border-radius: 10px;
}

.progress {
    display: block;
    height: 100%;
    background-color: #007bff;
    border-radius: 10px;
}

.input-field {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #888888;
  background-color: #303030;
  color: white;
  border-radius: 5px;
}

.button-group {
  width: 100%;
  display: flex;
  align-items: center;
}

.send-button,
.clear-button {
  font-size: 17px;
  padding: 8px 15px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
  border: 1px solid #909090;
}

.send-button:hover:not(:disabled),
.clear-button:hover:not(:disabled) {
  border: 1px solid #fff;
}

.send-button {
  margin: 0 10px;
}
</style>