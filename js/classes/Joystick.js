export default class Joystick {
    constructor({container=document.body, onMove, onJump}={}) {
        this.container = container
        this.onMove = onMove || (() => {})
        this.onJump = onJump || (() => {})

        this.keys = []
        this.radius = 40
        this.thumb = this.createThumb()

		this.origin = {left: this.thumb.offsetLeft, top: this.thumb.offsetTop}
        this.offset = {x: 0, y: 0}
        this.state = [0, 0]

        document.addEventListener("keydown", this.jump.bind(this))

        document.addEventListener("keypress", this.keyPress.bind(this))
        document.addEventListener("keyup", this.keyUp.bind(this))

        this.touch
            ? this.thumb.addEventListener("touchstart", this.mouseDown.bind(this))
            : this.thumb.addEventListener("mousedown", this.mouseDown.bind(this))
    }

    get touch() {
        return "ontouchstart" in window
    }

    keyState() {
        let forward = 0
        let turn = 0
        if(this.keys.length > 0) {
            if(this.keys.includes("w")) {
                forward = 1
            } else if(this.keys.includes("s")) {
                forward = -1
            }

            if(this.keys.includes("a")) {
                turn = -0.99
            } else if(this.keys.includes("d")) {
                turn = 0.99
            }
        }

        this.state = [forward, turn]
        return this.state
    }

    keyPress(e) {
        if(this.keys.indexOf(e.key) == -1) {
            this.keys.push(e.key)
        }
        this.onMove(this.keyState())
    }

    keyUp(e) {
        this.keys.splice(this.keys.indexOf(e.key), 1)
        this.onMove(this.keyState())
    }

    mouseDown(e) {
        e.stopPropagation()
        e.preventDefault()
        this.tap(e)
        return false
    }

    createThumb() {
        const shell = document.createElement("div")
        shell.style.cssText = `
            backdrop-filter: blur(2px);
            z-index: 100;
            user-select: none;
            position: fixed;
            bottom: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
            height: 5rem;
            width: 5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            background: rgba(126, 126, 126, 0.5);
            border-radius: 50%;
        `
        const thumb = document.createElement("div")
        thumb.style.cssText = `
            height: 2.5rem;
            width: 2.5rem;
            background: #000;
            border-radius: 50%;
            cursor: pointer;
        `

        shell.appendChild(thumb)
        this.container.appendChild(shell)
        return thumb
    }

    mouse(e){
        return {
            x: e.targetTouches ? e.targetTouches[0].pageX : e.clientX,
            y: e.targetTouches ? e.targetTouches[0].pageY : e.clientY
        }
	}

    jump(e) {
        if(e.key == " ") {
            this.onJump()
        }
    }

	move(e){
        const mouse = this.mouse(e)
       
        let left = mouse.x - this.offset.x
        let top = mouse.y - this.offset.y

        const mag = Math.pow(left, 2) + Math.pow(top, 2)
        if(mag > Math.pow(this.radius, 2)) {
            const dist = Math.sqrt(mag)
            left = (left / dist) * this.radius
            top = (top / dist) * this.radius
        }

        this.thumb.style.transform = `translate(${left}px, ${top}px)`
        const forward = -(top - this.origin.top + this.thumb.clientHeight / 2) / this.radius
		const turn = (left - this.origin.left + this.thumb.clientWidth / 2) / this.radius
        this.state = [forward, turn]
		this.onMove(this.state)
	}

    tap(e) {
		this.offset = this.mouse(e)

        const mouseMove = e => {
            e.preventDefault()
            this.move(e)
            return false
        }

        const mouseUp = e => {
            e.preventDefault()
            this.up(e)
            return false
        }

		if (this.touch) {
			document.ontouchmove = mouseMove
			document.ontouchend =  mouseUp
		} else{
			document.onmousemove = mouseMove
			document.onmouseup = mouseUp
		}
    }

    up() {
        if (this.touch) {
            document.ontouchmove = null
            document.touchend = null
        } else {
            document.onmousemove = null
            document.onmouseup = null
        }
        
        this.thumb.style.transform = ""

        this.state = [0, 0]
        this.onMove(this.state)
    }    
}