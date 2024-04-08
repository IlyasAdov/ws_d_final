<script setup>
import inputToken from '../components/inputToken.vue'
import Loading from '../components/Loading.vue'
import ChatMessages from '../components/ChatMessages.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <ErrorMessage v-if="errorStatus != null" :errorStatus="errorStatus" v-model:errorStatus="errorStatus"/>
  <div class="chat-page" :class="{ disabled: disabled }">
    <div class="sidebar">
      <div class="button-group">
        <RouterLink :to="{ name: 'home' }" class="back-button" title="Вернуться">&lt;</RouterLink>
        <button class="new-chat-button" @click="newChat()" :disabled="disabled" title="Новый чат">+</button>
      </div>
    </div>
    <div class="main-content">
      <div ref="container" class="conversation">
        <ChatMessages v-if="isAuth === true" :messages="messages" :newMessage="newMessage"/>
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
      conversationId: null,
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
      this.disabled = this.isAuth === true ? false : true
      this.conversationId = localStorage.getItem('conversation_id') || null
      this.viewMessages()
    } catch (error) {
      console.error('Error checking authentication:', error)
    }
  },

  updated() {
    this.scrollToBottom();
  },

  methods: {
    async sendData() {
      this.disabled = true;

      this.isAuth = await CheckToken()

      if (this.conversationId === null) {
        await axios.post(
          'http://127.0.0.1:3000/api/chat/conversation',
          { prompt: this.prompt },
          {
            headers: {
              'X-API-TOKEN': this.getStorageToken(),
              'Content-Type': 'application/json'
            }
          }
        ).then(response => {
          this.conversationId = response.data.conversation_id;
          localStorage.setItem('conversation_id', this.conversationId);

          this.newMessage = {
            req: this.prompt,
            res: ''
          }

          this.getResponse(this.conversationId)

          this.timer = setInterval(() => {
            this.getResponse(this.conversationId)
          }, 1000)

        })
        .catch(error => {
          this.errorStatus = error.response.status
        })
      } else {
        await axios.put(
          `http://127.0.0.1:3000/api/chat/conversation/${this.conversationId}`,
          { prompt: this.prompt },
          {
            headers: {
              'X-API-TOKEN': this.getStorageToken(),
              'Content-Type': 'application/json'
            }
          }
        ).then(() => {
          this.newMessage = {
            req: this.prompt,
            res: ''
          }

          this.getResponse(this.conversationId)

          this.timer = setInterval(() => {
            this.getResponse(this.conversationId)
          }, 1000)

        })
        .catch(error => {
          this.errorStatus = error.response.status
        })
      }
    },

    async getResponse(conversationId) {
      this.isAuth = await CheckToken()
      
      await axios.get(
      `http://127.0.0.1:3000/api/chat/conversation/${conversationId}`,
      {
        headers: {
          'X-API-TOKEN': this.getStorageToken()
        }
      })
        .then(response => {
          const trimmedResponse = response.data.response.replace(new RegExp("^" + this.newMessage.res), "");
          this.renderText(trimmedResponse, response.data.is_final)
        })
        .catch(error => {
          this.errorStatus = error.response.status
        })
    },

    renderText(text, isFinal) {
      if (isFinal) {
        clearInterval(this.timer)

        setTimeout(() => {
          this.messages.push({ req: this.newMessage.req, res: this.newMessage.res})
          this.newMessage = {}
          this.setMessagesToStorage(this.messages)
          this.disabled = false
        }, 1000)
      }

      let timeUp = 0

      for (let i = 0; i < text.length; i++) {
        let timeout = Math.floor(Math.random() * 19) + 2

        setTimeout(() => {
          this.newMessage.res += text[i]
        }, timeout + timeUp)

        timeUp += timeout
      }

      this.scrollToBottom()
    },

    viewMessages() {
      const getMessages = this.getMessagesForStorage()
      if (this.isAuth && getMessages) {
          this.messages = getMessages
          setTimeout(this.scrollToBottom, 150)
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.container.scrollTop = this.$refs.container.scrollHeight;
      });
    },

    newChat() {
      this.messages = []
      this.conversationId = null
      this.clearStorage()
    },

    clearInput() {
      this.prompt = ''
    },

    getStorageToken() {
      return localStorage.getItem('API-TOKEN')
    },

    getMessagesForStorage() {
      return JSON.parse(localStorage.getItem('messages')) || false
    },

    setMessagesToStorage(mess) {
      localStorage.setItem('messages', JSON.stringify(mess))
    },

    clearStorage() {
      localStorage.removeItem('conversation_id')
      localStorage.removeItem('messages')
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

.sidebar {
  position: fixed;
  background-color: #303030;
  border-radius: 0 0 15px 15px;
  left: 50%;
  transform: translateX(-50%);
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column; /* Располагаем элементы в столбец */
  justify-content: space-between; /* Распределяем элементы по вертикали равномерно */
  padding: 20px;
}

.button-group {
  display: flex;
  padding: 10px;
}

.back-button {
  text-decoration: none;
  width: 45px;
  text-align: center;
  font-size: 18px;
  padding: 10px;
  background-color: #414141;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  transition: 0.3s;
}

.new-chat-button {
  width: 45px;
  font-size: 18px;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.new-chat-button:hover {
  background-color: #006ce0;
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
