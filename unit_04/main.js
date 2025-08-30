let vueApp = new Vue({
    el: "#vueApp",
    data: {
        // ros connection
        ros: null,
        rosbridge_address: 'wss://i-0a610c62446cbedcf.robotigniteacademy.com/b5b7dcf7-9d70-43d0-8dce-c386cf8de26e/rosbridge/',
        connected: false,
        // subscriber data
        position: { x: 0, y: 0, z: 0, },
        // page content
        menu_title: 'Connection',
        main_title: 'Main title, from Vue!!',
    },
    methods: {
        connect: function() {
            // define ROSBridge connection object
            this.ros = new ROSLIB.Ros({
                url: this.rosbridge_address
            })

            // define callbacks
            this.ros.on('connection', () => {
                this.connected = true
                console.log('Connection to ROSBridge established!')
                let topic = new ROSLIB.Topic({
                    ros: this.ros,
                    name: '/fastbot/odom',
                    messageType: 'nav_msgs/Odometry'
                })
                topic.subscribe((message) => {
                    this.position = message.pose.pose.position
                    console.log(message)
                })
            })
            this.ros.on('error', (error) => {
                console.log('Something went wrong when trying to connect')
                console.log(error)
            })
            this.ros.on('close', () => {
                this.connected = false
                console.log('Connection to ROSBridge was closed!')
            })
        },
        disconnect: function() {
            this.ros.close()
        },
        sendCommand: function() {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/fastbot/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            })
            let message = new ROSLIB.Message({
                linear: { x: 0.2, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0.5, },
            })
            topic.publish(message)
        },
        turnRight: function() {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/fastbot/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            })
            let message = new ROSLIB.Message({
                linear: { x: 0.2, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: -0.5, },
            })
            topic.publish(message)
        },
        stop: function() {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/fastbot/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            })
            let message = new ROSLIB.Message({
                linear: { x: 0, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0, },
            })
            topic.publish(message)
        },

        turnOffFenceMode: function() {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/fastbot/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            })
            let message = new ROSLIB.Message({
                linear: { x: 0, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 1.0, },
            })
            topic.publish(message)
        },

        turnOnFenceMode: function() {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/fastbot/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            })
            let message = new ROSLIB.Message({
                linear: { x: 0, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: -1.0, },
            })
            topic.publish(message)
        },

        defence: function () {
            if (!this.connected || !this.position) return;

            const x = this.position.x || 0;
            const y = this.position.y || 0;

            // inside the safe box?
            const inBounds = (x > -0.2 && x < 0.2) && (y > -0.2 && y < 0.2);

            if (!inBounds) {
                // Outside: enable fence mode, then turn right and move forward
                this.turnOnFenceMode();

                // small stagger so the messages don't collide on the same tick
                setTimeout(() => {
                    this.turnRight();
                    // give a moment to start turning, then go forward
                    setTimeout(() => {
                        this.sendCommand();
                    }, 150);
                }, 100);
            } else {
                // Inside: ensure fence mode is off
                this.turnOffFenceMode();
            }
        },
    },
    mounted() {
        // page is ready
        console.log('page is ready!')
    },
})