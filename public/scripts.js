var ObjCourse = function (items) {
  this.name = items[1]
  this.campus = items[2]
  this.method = items[3]
  this.teacher = items[4]
  this.gp = items[5]
  this.slot = items[7]
  this.time = items[8]
  this.timeraw = items[9]
}
ObjCourse.prototype.print = function () {
  return `课程 ${this.name} 开课校区 ${this.campus} 授课方式 ${this.method} 授课老师 ${this.teacher} 学分 ${this.gp} 总学时 ${this.slot} 上课时间 ${this.time}`
}

function EXCEPTION(exception, message) {
  this.exception = exception
  this.message = message
  this.name = 'error'
  return `${this.name}: ${this.message}`
}

class CourseSelect {
  courseGraph = new Map()
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
    this.dataCourses = data_courses
    this.tableTTL = this.#init_tableTTL()
    this.#parseData()
    try {
      this.courselist = this.#validateCourselist(courselist)
    } catch (e) {
      throw e
    }
  }
  #fixCourseName(e) {
    let name = null
    let ee = e.replace('IV', 'Ⅳ')
    ee = ee.replace('III', 'Ⅲ')
    ee = ee.replace('II', 'Ⅱ')
    ee = ee.replace('I', 'Ⅰ')
    let re = new RegExp(['', ...ee, ''].join('.*'))
    this.data.forEach((value) => {
      let res = re.exec(value.name)
      if (res != null) name = res
    })
    return name
  }
  #validateCourselist(courselist) {
    let res = []
    for (let arg of courselist) {
      let ok = false
      this.data.forEach((value) => {
        if (value.name === arg) ok = true
      })
      if (!ok) {
        let fixedname = this.#fixCourseName(arg)
        if (fixedname) res.push(fixedname[0])
        else {
          window.alert(`课程 ${arg} 不存在，请检查输入`)
          throw new EXCEPTION('输入有问题', arg)
        }
      } else res.push(arg)
    }
    return res
  }
  #s(node, tmp) {
    if (this.visited.has(node) != false) return
    this.visited.add(node)
    let timelist = []
    if (
      !(this.courselist.includes(node) || node === 'root' || tmp.includes(node))
    ) {
      timelist = this.data.get(node).time
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
    if (this.courseGraph.get(node) === undefined) {
      let tmp2 = JSON.parse(JSON.stringify(tmp))
      this.res.push(tmp2)
      return
    }
    for (let neighbour of this.courseGraph.get(node)) {
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
    let it = this.courselist[Symbol.iterator]()
    let thisCourse = 'root'
    let nextCourse = it.next().value
    let nextlist = new Array()
    while (nextCourse != undefined) {
      nextlist = this.map_name_ID.get(nextCourse)
      this.courseGraph.set(thisCourse, nextlist)
      for (let arg of nextlist) {
        this.courseGraph.set(arg, [nextCourse])
      }
      thisCourse = nextCourse
      nextCourse = it.next().value
    }
  }
  #parseData() {
    this.map_name_ID = new Map()
    this.dataCourses.forEach((course) => {
      let items = course.replace('\r', '').split('","')
      items[0] = items[0].replace('"', '')
      items[items.length - 1] = items[items.length - 1].replace('",', '')
      items.push(items[items.length - 1])
      items[items.length - 2] = this.#parseTime(items[items.length - 2])
      this.data.set(items[0], new ObjCourse(items))
      let li = this.map_name_ID.get(items[1])
      if (li === undefined) {
        this.map_name_ID.set(items[1], [items[0]])
      } else {
        li.push(items[0])
        this.map_name_ID.set(items[1], li)
      }
    })
  }
  #parseTime(time) {
    let li = []
    if (time.includes(';')) time = time.split(';')
    else time = [time]
    for (let t of time) {
      if (t.replace(/\d+\-\d+周/i, '') === '') return []
      let timeFULL = t.replace(
        /([0-9,\-]+)周 (.)\((\d+(-\d+)?)节\)(.*)/i,
        '$1;$2;$3;$4;$5'
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
            if (timeSep[4] === '单') {
              for (let ix = Number(a); ix < Number(b) + 1; ix++)
                if (ix % 2) {
                  x.push(ix)
                }
            } else if (timeSep[4] === '双') {
              for (let ix = Number(a); ix < Number(b) + 1; ix++)
                if (!(ix % 2)) {
                  x.push(ix)
                }
            } else {
              for (let ix = Number(a); ix < Number(b) + 1; ix++) x.push(ix)
            }
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
      if (timeSep[3]) {
        let cls = timeSep[2]
        let c, d
        ;[c, d] = cls.split('-')
        for (let iz = Number(c); iz < Number(d) + 1; iz++) z.push(iz)
      } else z.push(timeSep[2])
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

function printSolutionsListView(solutions) {
  $('#solutions-list > li').remove()
  let cnt = 1
  for (let solution of solutions) {
    let li = `<li data=${solution.join(
      ';'
    )} selected="false" id="solution${cnt}"> 方案${cnt} </li>`
    $('#solutions-list').append(li)
    cnt++
  }
  $('#solution1').attr('selected', 'true')
  $('.solution').css('display', 'block')
}
// function updateSolutionsTableView() {
//   printSolutionsTableView()
// }
function printSolutionsTableView2() {
  console.log('called')
  $(`.course-list`).css('display', 'table')
  $('[week][style]').removeAttr('style')
  $('table.course-list > tbody >tr:gt(0)').remove()
  cs = $("li[selected='selected']").attr('data').split(';')
  for (let c of cs) {
    let items = searchRes.data.get(c)
    let tr = `<tr><td>${c}</td><td>${items.name}</td><td>${items.campus}</td><td>${items.method}</td><td>${items.teacher}</td><td>${items.gp}</td><td>${items.slot}</td><td class="last-column">${items.timeraw}</td></tr>`
    $('table.course-list > tbody').append(tr)
  }
}
function printSolutionsTableView() {
  initTable()
  let cs = $("li[selected='selected']").attr('data').split(';')
  for (let c of cs) {
    timelist = searchRes.data.get(c).time
    for (let t of timelist) {
      let [x, y, z] = t
      $(
        `[week=${x}] > tbody > tr:nth-child(${z + 1}) > td:nth-child(${y + 1})`
      ).text(searchRes.data.get(c).name)
    }
  }
}
function submitSearch() {
  searchRes = ''
  let list = $('#input-text')[0].value.trim().split(',')
  list = list.map((e) => e.trim())
  try {
    searchRes = new CourseSelect(list, courses)
    printSolutionsListView(searchRes.Select())
    printSolutionsTableView()
  } catch (e) {
    console.error(e)
  }
  // $('#output').text(a.print())
}
function initTable() {
  templete = document.querySelector('#solution-table > div > table')
  $('table.course-list').removeAttr('style')
  $('[week]').remove()
  for (let i = 0; i < 18; i++) {
    tableWeek = templete.cloneNode(true)
    tableWeek.setAttribute('week', `${i + 1}`)
    templete.after(tableWeek)
  }
  $('[week][style]').removeAttr('style')
  templete.setAttribute('style', 'display:none')
  $(`[week=1]`).css('display', 'table')
  for (let i = 1; i < 19; i++) {
    $(`[week=${i}] > tbody > tr:nth-child(1) > td:nth-child(1)`).text(
      `第${i}周`
    )
  }
}
//script begin here
const Http = new XMLHttpRequest()
const url = './data.csv'
Http.open('GET', url)
Http.send()
var courses
var searchRes
var tableWeek = []

setTimeout(() => {
  initTable()
  document.getElementById('page-previous').onclick = () => {
    let currWeek = Number($('[week][style]').attr('week'))
    if (currWeek - 1 > 0) {
      $('[week][style]').removeAttr('style')
      $(`[week=${currWeek - 1}]`).css('display', 'table')
    }
  }
  document.getElementById('page-after').onclick = () => {
    let currWeek = Number($('[week][style]').attr('week'))
    if (currWeek + 1 < 19) {
      $('[week][style]').removeAttr('style')
      $(`[week=${currWeek + 1}]`).css('display', 'table')
    }
  }
  document.getElementById('solution-previous').onclick = () => {
    let currWeek = Number(
      $('[selected=selected]').attr('id').replace('solution', '')
    )
    if (currWeek - 1 > 0) {
      $(`#solution${currWeek}`).removeAttr('selected')
      $(`#solution${currWeek - 1}`).attr('selected', 'selected')
      if (!$('[week][style]').length) printSolutionsTableView2()
      else printSolutionsTableView()
    }
  }
  document.getElementById('solution-next').onclick = () => {
    let currWeek = Number($('[selected]').attr('id').replace('solution', ''))
    if (currWeek + 1 < $('[selected]').length + 1) {
      $(`#solution${currWeek}`).removeAttr('selected')
      $(`#solution${currWeek + 1}`).attr('selected', 'selected')
      if (!$('[week][style]').length) printSolutionsTableView2()
      else printSolutionsTableView()
    }
  }
  // document.getElementById('list-view').onclick = printSolutionsListView()
  // document.getElementById('grid-view').onclick = printSolutionsTableView()
})

Http.onreadystatechange = (e) => {
  if (Http.readyState === Http.DONE) {
    courses = Http.responseText.split('\n').slice(1)
    courses.sort()
    $('#input-submit').removeAttr('disabled')
  }
}
