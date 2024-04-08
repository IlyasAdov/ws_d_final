<script setup>
import inputToken from '../components/inputToken.vue'
import Loading from '../components/Loading.vue'
import ImageGeneration from '../components/ImageGeneration.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
</script>

<template>
  <ErrorMessage v-if="errorStatus != null" :errorStatus="errorStatus" v-model:errorStatus="errorStatus"/>
  <RouterLink :to="{ name: 'home' }" class="back-button">&lt;</RouterLink>
  <div class="chat-page" :class="{ disabled: disabled }">
    <div class="main-content">
      <div ref="container" class="conversation">
        <ImageGeneration v-if="isAuth === true" 
            :messages="messages" 
            :newMessage="newMessage" 
            :disabled="disabled" 
            :downloadImage="downloadImage"
            :upscaleImage="upscaleImage"
            :zoomInImage="zoomInImage"
            :zoomOutImage="zoomOutImage"
        />
        <inputToken v-else-if="isAuth !== true" v-model:isAuth="isAuth" v-model:disabled="disabled"/>
        <Loading v-else />
      </div>
      <div class="input-area">
        <input class="input-field" type="text" v-model="prompt" :disabled="disabled" @keyup.enter="sendData()"/>
        <button class="send-button" title="Отправить" :disabled="disabled" @click="sendData()">
          &rsaquo;
        </button>
        <button class="clear-button" title="Очистить" :disabled="disabled" @click="clearInput()">
          &times;
        </button>
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
      prompt: '',
      newMessage: {},
      messages: [],
      errorStatus: null,
      timer: null,
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
      this.disabled = true;

      this.isAuth = await CheckToken()

      await axios.post(
        'http://127.0.0.1:3000/api/imagegeneration/generate',
        { text_prompt: this.prompt },
        {
          headers: {
            'X-API-TOKEN': this.getStorageToken(),
            'Content-Type': 'application/json'
          }
        }
      ).then(response => {
        const jobId = response.data.job_id;

        this.newMessage = {
          req: this.prompt,
          res: '',
          progress: 0
        }

        this.setIntervalRequests(jobId)
      })
      .catch(error => {
        this.errorStatus = error.response.status
      })
    },

    setIntervalRequests(id) {
        this.getStatus(id)

        this.timer = setInterval(() => this.getStatus(id), 2000)
    },

    async getStatus(jobId) {
      this.disabled = true;

      this.isAuth = await CheckToken()

      await axios.get(
      `http://127.0.0.1:3000/api/imagegeneration/status/${jobId}`,
      {
        headers: {
          'X-API-TOKEN': this.getStorageToken()
        }
      })
        .then(response => {
          if(response.data.status == "finished") {
            clearInterval(this.timer)
            this.progressBar(response.data.progress)
            return this.getResult(jobId)
          }

          this.progressBar(response.data.progress, response.data.image_url)
        })
        .catch(error => {
          this.errorStatus = error.response.status
        })
    },

    async getResult(jobId) {
      this.disabled = true;

      this.isAuth = await CheckToken()

      await axios.get(
      `http://127.0.0.1:3000/api/imagegeneration/result/${jobId}`,
      {
        headers: {
          'X-API-TOKEN': this.getStorageToken()
        }
      })
        .then(response => {
          setTimeout(() => {
            this.messages.push({ req: this.newMessage.req, res: response.data.image_url, resource_id: response.data.resource_id })
            this.newMessage = {}

            this.setMessagesToStorage(this.messages)
            this.disabled = false
          }, 500)
        })
        .catch(error => {
          this.errorStatus = error.response.status
        })
    },

    async downloadImage(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'image.png';
            link.click();
        } catch (error) {
            console.error('Ошибка загрузки изображения:', error);
        }
    },

    async upscaleImage(id) {
        this.disabled = true;

        this.isAuth = await CheckToken()

        await axios.post(
            'http://127.0.0.1:3000/api/imagegeneration/upscale',
            { resource_id: id },
            {
                headers: {
                    'X-API-TOKEN': this.getStorageToken(),
                    'Content-Type': 'application/json'
                }
            }
        ).then(response => {
            const jobId = response.data.job_id;

            this.newMessage = {
                req: 'upscale',
                res: '',
                progress: 0
            }

            this.setIntervalRequests(jobId)
        })
        .catch(error => {
          this.errorStatus = error.response.status
        })
    },

    async zoomInImage(id) {
        this.disabled = true;

        this.isAuth = await CheckToken()

        await axios.post(
            'http://127.0.0.1:3000/api/imagegeneration/zoom/in',
            { resource_id: id },
            {
                headers: {
                    'X-API-TOKEN': this.getStorageToken(),
                    'Content-Type': 'application/json'
                }
            }
        ).then(response => {
            const jobId = response.data.job_id;

            this.newMessage = {
                req: 'zoom in',
                res: '',
                progress: 0
            }

            this.setIntervalRequests(jobId)
        })
        .catch(error => {
          this.errorStatus = error.response.status
        })
    },

    async zoomOutImage(id) {
        this.disabled = true;

        this.isAuth = await CheckToken()

        await axios.post(
            'http://127.0.0.1:3000/api/imagegeneration/zoom/out',
            { resource_id: id },
            {
                headers: {
                    'X-API-TOKEN': this.getStorageToken(),
                    'Content-Type': 'application/json'
                }
            }
        ).then(response => {
            const jobId = response.data.job_id;

            this.newMessage = {
                req: 'zoom out',
                res: '',
                progress: 0
            }

            this.setIntervalRequests(jobId)
        })
        .catch(error => {
          this.errorStatus = error.response.status
        })
    },

    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.container.scrollTop = this.$refs.container.scrollHeight;
      });
    },

    progressBar(progress, image) {
      for (let i = 0; i < progress - this.newMessage.progress; i++) {
        setTimeout(() => {
          this.newMessage.progress++
        }, i * 20)
      }
      this.newMessage.res = image
    },

    clearInput() {
      this.prompt = ''
    },

    getStorageToken() {
      return localStorage.getItem('API-TOKEN')
    },

    getMessagesForStorage() {
      return JSON.parse(localStorage.getItem('image-generation')) || false
    },

    setMessagesToStorage(data) {
      localStorage.setItem('image-generation', JSON.stringify(data))
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
  align-items: center;
  padding: 20px 0 0 0;
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
  display: flex;
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
