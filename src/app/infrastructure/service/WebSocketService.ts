// ===============================================
// File: src/app/infrastructure/service/WebSocketService.ts
// ===============================================
type ClientRole = "user" | "restaurant"
type MessageListener = (data: any) => void

class WebSocketService {
  private static instance: WebSocketService
  private socket: WebSocket | null = null
  private isConnected = false
  private isConnecting = false
  private readonly WS_URL = "wss://quickbite-apiorder.onrender.com"

  /** Mensajes pendientes mientras se abre el socket */
  private pending: any[] = []

  /** Conjunto para evitar registrar el mismo (role,uid) más de una vez */
  private registered = new Set<string>()

  private listeners: MessageListener[] = []

  private constructor() {
    /*  ya NO abrimos la conexión aquí  */
  }

  /** Singleton */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  /** Apertura diferida */
  private initConnection() {
    if (this.isConnected || this.isConnecting) return
    this.isConnecting = true

    console.log("[WebSocketService] Connecting...")
    this.socket = new WebSocket(this.WS_URL)

    this.socket.onopen = () => {
      console.log("[WebSocketService] Connected ✔")
      this.isConnected = true
      this.isConnecting = false
      /* Enviamos todo lo que estaba encolado */
      this.pending.forEach((m) => this.socket!.send(JSON.stringify(m)))
      this.pending = []
    }

    this.socket.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        this.listeners.forEach((cb) => cb(data))
        console.log("[WebSocketService] Mensaje recibido:", data);
      } catch (err) {
        console.error("[WebSocketService] JSON parse error:", err)
      }
    }

    this.socket.onclose = (ev) => {
      console.warn("[WebSocketService] Closed:", ev.reason)
      this.isConnected = false
      this.socket = null
      this.registered.clear()
    }

    this.socket.onerror = (err) => {
      console.error("[WebSocketService] Error:", err)
    }
  }

  /** Cola si el socket aún no está listo */
  private send(message: any) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message))
    } else {
      this.pending.push(message)
    }
  }

  /** Registro del cliente; crea la conexión si aún no existe */
  public registerClient(role: ClientRole, uid: string) {
    const key = `${role}:${uid}`
    if (this.registered.has(key)) return    // ya registrado

    this.initConnection()                   // abre conexión si hace falta
    this.send({ type: "register", role, uid })
    this.registered.add(key)
    console.log("Se envia registro", { type: "register", role, uid });
    
  }

  /* Listeners de negocio --------------------------------------------------- */
  public addMessageListener(listener: MessageListener) {
    this.listeners.push(listener)
  }

  public removeMessageListener(listener: MessageListener) {
    this.listeners = this.listeners.filter((fn) => fn !== listener)
  }

  /** Cerrar explícitamente (por ejemplo al logout) */
  public closeConnection() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.isConnected = false
      this.pending = []
      this.registered.clear()
    }
  }
}

export const webSocketService = WebSocketService.getInstance()
