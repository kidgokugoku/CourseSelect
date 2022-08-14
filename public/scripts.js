var ObjCourse = function (items) {
  this.name = items[1]
  this.campus = items[2]
  this.method = items[3]
  this.teacher = items[4]
  this.gp = items[5]
  this.slot = items[7]
  this.time = items[8]
}
ObjCourse.prototype.print = function () {
  return `课程 ${this.name} 开课校区 ${this.campus} 授课方式 ${this.method} 授课老师 ${this.teacher} 学分 ${this.gp} 总学时 ${this.slot} 上课时间 ${this.time}`
}

class CourseSelect {
  coursegraph = new Map()
  visited = new Set()
  selections = []
  res = []
  data = new Map()
  DICT_WEEKDAY = new Map([
    ['一', '1'],
    ['二', '2'],
    ['三', '3'],
    ['四', '4'],
    ['五', '5'],
    ['六', '6'],
    ['日', '7'],
  ])

  constructor(courselist, data_courses) {
    //#validateCourselist()
    this.courselist = courselist
    this.data_courses = data_courses
    this.tableTTL = this.#init_tableTTL()
  }
  // #validateCourselist(courselist){
  //   for(let arg of courselist)
  // }
  #s(node, tmp) {
    if (this.visited.has(node) != false) return
    this.visited.add(node)
    let timelist = []
    if (
      !(this.courselist.includes(node) || node === 'root' || tmp.includes(node))
    ) {
      timelist = this.#parseTime(node)
      for (let time of timelist) {
        let x, y, z
        ;[x, y, z] = time
        if (this.tableTTL[x][y][z] != 0) return
      }
      for (let time of timelist) {
        let x, y, z
        ;[x, y, z] = time
        this.tableTTL[x][y][z] = 1
      }
      tmp.push(node)
    }
    if (this.coursegraph.get(node) === undefined) {
      let tmp2 = JSON.parse(JSON.stringify(tmp))
      this.res.push(tmp2)
      return
    }
    for (let neighbour of this.coursegraph.get(node)) {
      this.#s(neighbour, tmp)
      this.visited.delete(neighbour)
      if (timelist.length) {
        for (let time of timelist) {
          let [x, y, z] = time
          this.tableTTL[x][y][z] = 0
        }
        tmp.pop()
      }
      continue
    }
  }
  Select() {
    this.#generateGraph()
    this.#s('root', [])
    return this.res
  }
  #init_tableTTL() {
    let arr = new Array(18)
    for (let i = 0; i < arr.length; i++) {
      let ar = new Array(7)
      for (let j = 0; j < arr.length; j++) {
        ar[j] = new Array(12).fill(0)
      }
      arr[i] = ar
    }
    return arr
  }
  #generateGraph() {
    this.dict_name_ID = new Map()
    this.dict_ID_time = new Map()
    let cnt = 0
    this.data_courses.forEach((course) => {
      let items = course.replace('\r', '').split('","')
      items[0] = items[0].replace('"', '')
      items[items.length - 1] = items[items.length - 1].replace('",', '')
      this.data.set(items[0], new ObjCourse(items))
      let li = this.dict_name_ID.get(items[1])
      if (li === undefined) {
        this.dict_name_ID.set(items[1], [items[0]])
      } else {
        li.push(items[0])
        this.dict_name_ID.set(items[1], li)
      }
      this.dict_ID_time.set(items[0], items[items.length - 1])
      cnt++
      if (cnt == this.data_courses.length) {
        let it = this.courselist[Symbol.iterator]()
        let thisCourse = 'root'
        let nextCourse = it.next().value
        let nextlist = new Array()
        while (nextCourse != undefined) {
          nextlist = this.dict_name_ID.get(nextCourse)
          this.coursegraph.set(thisCourse, nextlist)
          for (let arg of nextlist) {
            this.coursegraph.set(arg, [nextCourse])
          }
          thisCourse = nextCourse
          nextCourse = it.next().value
        }
      }
    })
  }
  #parseTime(node) {
    let li = []
    let time = this.dict_ID_time.get(node)
    if (time.includes(';')) time = time.split(';')
    else time = [time]
    for (let t of time) {
      let timeFULL = t.replace(
        /([0-9,\-]+)周 (.)\((\d+-\d+)节\).*/i,
        '$1;$2;$3'
      )
      let timeSep = timeFULL.split(';')
      let x = []
      let y = []
      let z = []
      //week
      let week, a, b
      if (timeSep[0].includes(',')) week = timeSep[0].split(',')
      else {
        week = [timeSep[0]]
        for (let wk of week) {
          if (!wk.includes('-')) x.push(wk)
          else {
            ;[a, b] = wk.split('-')
            for (let ix = Number(a); ix < Number(b) + 1; ix++) x.push(ix)
          }
        }
      }
      //days
      y = timeSep[1]
      let it = this.DICT_WEEKDAY.keys()
      let key = it.next().value
      while (key != undefined) {
        y = y.replace(key, this.DICT_WEEKDAY.get(key))
        key = it.next().value
      }
      //c
      let cls = timeSep[2]
      let c, d
      ;[c, d] = cls.split('-')
      for (let iz = Number(c); iz < Number(d) + 1; iz++) z.push(iz)
      for (let i of x)
        for (let j of y) for (let k of z) li.push([i, Number(j), k])
      return li
    }
  }
  print() {
    let output = ''
    let cnt = 1
    for (let r of this.res) {
      output += `方案${cnt} :\n`
      for (let c of r) {
        output += `选课号： ${c} `
        output += this.data.get(c).print() + '\n'
      }
      cnt++
    }
    return output
  }
}
const Http = new XMLHttpRequest()
const url = './data.csv'
Http.open('GET', url)
Http.send()
var courses

Http.onreadystatechange = (e) => {
  if (Http.readyState === Http.DONE) {
    courses = Http.responseText.split('\n').slice(1)
    courses.sort()
    $('#input_submit').removeAttr('disabled')
  }
}
function submitSearch() {
  list = $('#input_text')[0].value.split(',')
  let a = new CourseSelect(list, courses)
  a.Select()
  $('#output').text(a.print())
}
