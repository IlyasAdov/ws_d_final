<template>
    <div class="getToken">
        <p>Необходимо ввести API токен, чтобы начать работу!</p>
        <div>
            <input class="input-field" type="text" v-model="token"/>
            <button class="send-button" title="Отправить" @click="sendData()">
            &#129034;
            </button>
            <button class="clear-button" title="Очистить" @click="clearInput()">
            &#128465;
            </button>
        </div>
        <p v-show="message.length > 0" style="color: red">{{ message }}</p>
    </div>
</template>

<script>
    import CheckToken from '../components/CheckToken.vue'
    export default {
        data () {
            return {
                token: '',
                message: ''
            }
        },

        methods: {
            async sendData() {
                this.message = 'Загрузка...';
                if (this.token.length > 0) {
                    localStorage.setItem('API-TOKEN', this.token);
                    try {
                        const isValidToken = await CheckToken();
                        if (isValidToken === true) {
                            this.message = 'Вы ввели правильный токен!';
                            setTimeout(() => {
                                this.$emit('update:isAuth', isValidToken);
                                this.$emit('update:disabled', false);
                            }, 1000);
                        } else if (isValidToken == 403) {
                            this.$emit('update:isAuth', isValidToken);
                            this.message = 'Привышен лимит квоты на этот месяц!';
                        } else {
                            this.$emit('update:isAuth', isValidToken);
                            this.message = 'Данный токен не найден!';
                        }
                    } catch (error) {
                        console.error(error);
                        this.message = 'Ошибка при проверке токена!';
                    }
                } else {
                    this.message = 'Введите токен!';
                }
            },

            clearInput() {
                this.token = ''
            },
        }
    }
</script>