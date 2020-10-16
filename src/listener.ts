import {
  loadImageAsync,
  ObjectKeys
} from './util'

enum performanceDataEnum {
  INIT = 'init',
  LOAD_START = 'loadStart',
  LOAD_END = 'loadEnd'
}

export default class ReactiveListener {
  el: HTMLElement | any
  src: any
  error: any
  loading: any
  bindType: any
  attempt: number
  cors: any
  naturalHeight: number
  naturalWidth: number
  options: any
  rect: any
  $parent: any
  elRenderer: any
  _imageCache: any
  performanceData: any
  state!: { loading: boolean; error: boolean; loaded: boolean; rendered: boolean }
  constructor(el: HTMLElement, src: any, error: any, loading: any, bindType?: any, $parent?: any, options?: any, cors?: any, elRenderer?: any, imageCache?: any) {
    this.el = el
    this.src = src
    this.error = error
    this.loading = loading
    this.bindType = bindType
    this.attempt = 0
    this.cors = cors

    this.naturalHeight = 0
    this.naturalWidth = 0

    this.options = options

    this.rect = null

    this.$parent = $parent
    this.elRenderer = elRenderer
    this._imageCache = imageCache
    this.performanceData = {
      init: Date.now(),
      loadStart: 0,
      loadEnd: 0
    }

    this.filter()
    this.initState()
    this.render('loading', false)
  }

  /*
   * init listener state
   * @return
   */
  initState() {
    if (this.el) {
      if ('dataset' in this.el) {
        this.el.dataset.src = this.src
      } else {
        this.el.setAttribute('data-src', this.src)
      }

      this.state = {
        loading: false,
        error: false,
        loaded: false,
        rendered: false
      }
    }

  }

  /*
   * record performance
   * @return
   */
  record(event: string) {
    this.performanceData[event] = Date.now()
  }

  /*
   * update image listener data
   * @param  {String} image uri
   * @param  {String} loading image uri
   * @param  {String} error image uri
   * @return
   */
  update(src: string, loading: string, error: string) {
    const oldSrc = this.src
    this.src = src
    this.loading = loading
    this.error = error
    this.filter()
    if (oldSrc !== this.src) {
      this.attempt = 0
      this.initState()
    }
  }

  /*
   * get el node rect
   * @return
   */
  getRect() {
    if (this.el) this.rect = this.el.getBoundingClientRect()
  }

  /*
   *  check el is in view
   * @return {Boolean} el is in view
   */
  checkInView() {    
    this.getRect()
    return (this.rect.top < window.innerHeight * this.options.preLoad && this.rect.bottom > this.options.preLoadTop) &&
      (this.rect.left < window.innerWidth * this.options.preLoad && this.rect.right > 0)
  }

  /*
   * listener filter
   */
  filter() {
    ObjectKeys(this.options.filter).map(key => {
      this.options.filter[key](this, this.options)
    })
  }

  /*
   * render loading first
   * @params cb:Function
   * @return
   */
  renderLoading(cb: () => void) {
    this.state.loading = true
    loadImageAsync({
      src: this.loading,
      cors: this.cors
    }, () => {
      this.render('loading', false)
      this.state.loading = false
      cb()
    }, () => {
      // handler `loading image` load failed
      cb()
      this.state.loading = false
      if (!this.options.silent) console.warn(`VueLazyload log: load failed with loading image(${this.loading})`)
    })
  }

  /*
   * try load image and  render it
   * @return
   */
  load(onFinish: () => void = () => {}) {
    if ((this.attempt > this.options.attempt - 1) && this.state.error) {
      if (!this.options.silent) console.log(`VueLazyload log: ${this.src} tried too more than ${this.options.attempt} times`)
      onFinish()
      return
    }
    if (this.state.rendered && this.state.loaded) return
    if (this._imageCache.has(this.src)) {
      this.state.loaded = true
      this.render('loaded', true)
      this.state.rendered = true
      return onFinish()
    }

    this.renderLoading(() => {
      this.attempt++

      this.options.adapter['beforeLoad'] && this.options.adapter['beforeLoad'](this, this.options)
      this.record('loadStart')

      loadImageAsync({
        src: this.src,
        cors: this.cors
      }, (data: any) => {
        this.naturalHeight = data.naturalHeight
        this.naturalWidth = data.naturalWidth
        this.state.loaded = true
        this.state.error = false
        this.record('loadEnd')
        this.render('loaded', false)
        this.state.rendered = true
        this._imageCache.add(this.src)
        onFinish()
      }, err => {
        !this.options.silent && console.error(err)
        this.state.error = true
        this.state.loaded = false
        this.render('error', false)
      })
    })
  }

  /*
   * render image
   * @param  {String} state to render // ['loading', 'src', 'error']
   * @param  {String} is form cache
   * @return
   */
  render(state: string, cache: boolean) {
    this.elRenderer(this, state, cache)
  }

  /*
   * output performance data
   * @return {Object} performance data
   */
  performance() {
    let state = 'loading'
    let time = 0

    if (this.state.loaded) {
      state = 'loaded'
      time = (this.performanceData.loadEnd - this.performanceData.loadStart) / 1000
    }

    if (this.state.error) state = 'error'

    return {
      src: this.src,
      state,
      time
    }
  }

  /*
   * $destroy
   * @return
   */
  $destroy() {
    this.el = null
    this.src = null
    this.error = null
    this.loading = null
    this.bindType = null
    this.attempt = 0
  }
}
