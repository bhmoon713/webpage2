var app = new Vue({
    el: '#app',
    // storing the state of the page
    data: {
        connected: false,
        ros: null,
        logs: [],
        loading: false,
        rosbridge_address: 'wss://i-0624d6d105111e280.robotigniteacademy.com/a8480edb-c03c-41e3-9097-3cf29c0f667c/rosbridge/',
        port: '9090',
        service_busy: false,
        param_linear_x: 0,
        param_angular_z: 0,
    },
    // helper methods to connect to ROS
    methods: {
        connect: function() {
            this.loading = true
            this.ros = new ROSLIB.Ros({
                url: this.rosbridge_address
            })
            this.ros.on('connection', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Connected!')
                this.connected = true
                this.loading = false
            })
            this.ros.on('error', (error) => {
                this.logs.unshift((new Date()).toTimeString() + ` - Error: ${error}`)
            })
            this.ros.on('close', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Disconnected!')
                this.connected = false
                this.loading = false
            })
        },
        disconnect: function() {
            this.ros.close()
        },
        set_parameters: function() {
            // set as busy
            service_busy = true

            let linear_x = new ROSLIB.Param({
                ros: this.ros,
                name: '/param_vel_node:linear_x'
            })
            linear_x.set(this.param_linear_x.toPrecision(2))


            let angular_z = new ROSLIB.Param({
                ros: this.ros,
                name: '/param_vel_node:angular_z'
            })
            angular_z.set(this.param_angular_z.toPrecision(2))

            // set as not busy
            service_busy = false
        },
        stop_robot: function() {
            // set as busy
            service_busy = true

            this.param_linear_x = 0
            this.param_angular_z = 0
            this.set_parameters()

            // set as not busy
            service_busy = false
        },
    },
    mounted() {
    },
})