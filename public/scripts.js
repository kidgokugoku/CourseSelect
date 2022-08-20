var ObjCourse = function (items) {
  this.name = items[1]
  this.campus = items[2]
  this.method = items[3]
  this.teacher = items[4]
  this.gp = items[5]
  this.slot = items[7]
  this.type = items[8]
  this.time = items[9]
  this.timeraw = items[10]
}
ObjCourse.prototype.print = function () {
  return `课程 ${this.name} 开课校区 ${this.campus} 授课方式 ${this.method} 授课老师 ${this.teacher} 学分 ${this.gp} 总学时 ${this.slot} 上课时间 ${this.time}`
}

if (!Array.prototype.subsetTo) {
  Array.prototype.subsetTo = function (arr) {
    return this.every((v) => arr.includes(v))
  }
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
  selectionItems = []
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
      console.log(timelist)
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
    let start = new Date().getTime()
    this.#s('root', [])
    let end = new Date().getTime()
    console.log(`搜索用时:${end - start}ms`)
    if (this.res.length > 0) return this.res
    else return null
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
        this.selectionItems.push(arg)
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
    console.log(time)
    if (time.includes(';')) time = time.split(';')
    else time = [time]
    console.log(time)
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
    }
    return li
  }
  findAvalibleCommon(res) {
    let tempTTL = this.#init_tableTTL()
    for (let e of res) {
      timelist = this.data.get(e).time
      for (let time of timelist) {
        let x, y, z
        ;[x, y, z] = time
        tempTTL[x][y][z] = 1
      }
    }
    let li = []
    this.data.forEach((value, key) => {
      if (value.type != 'Common') return
      let timelist = value.time
      for (let time of timelist) {
        let x, y, z
        ;[x, y, z] = time
        if (tempTTL[x][y][z] != 0) return
      }
      li.push(key)
    })
    return li
  }
  findAvaliblePE(res) {
    let tempTTL = this.#init_tableTTL()
    for (let e of res) {
      timelist = this.data.get(e).time
      for (let time of timelist) {
        let x, y, z
        ;[x, y, z] = time
        tempTTL[x][y][z] = 1
      }
    }
    let li = []
    this.data.forEach((value, key) => {
      if (!value.name.includes('体育')) return
      let timelist = value.time
      for (let time of timelist) {
        let x, y, z
        ;[x, y, z] = time
        if (tempTTL[x][y][z] != 0) return
      }
      li.push(key)
    })
    return li
  }
  getSelectionItems() {
    return this.selectionItems
  }
}

function generateSolutionsList(solutions) {
  $('#solutions-list > li').remove()
  $('#alt-solution-list > li').remove()
  let cnt = 1
  for (let solution of solutions) {
    let li = `<li data=${solution.join(
      ';'
    )} selected="false" id="solution${cnt}"><button class="btn-solution" onclick="changeSolutionTo(${cnt})"> #${cnt} </button></li>`
    $('#solutions-list').append(li)
    cnt++
  }
  $('#solution1').attr('selected', 'true')
  $('.solution').css('display', 'block')
  $('.alt-solution').css('display', 'block')
  $('.view').removeAttr('disabled')
}
function hideCheckboxItems() {
  $("tr>td>input[type='checkbox']")
    .parent()
    .parent()
    .attr('style', 'display:none;')
}
function showCheckboxItems(itemID) {
  $(`tr>td>input[type='checkbox'][data-course-id='${itemID}']`)
    .parent()
    .parent()
    .removeAttr('style')
}
function updateCheckBoxListFromSolution() {
  cs = $("li[selected='selected']").attr('data').split(';')
  $("tr>td>input[type='checkbox']").removeAttr('checked')
  hideCheckboxItems()
  for (let c of cs) {
    $(`tr>td>input[type='checkbox'][data-course-id='${c}']`).attr(
      'checked',
      'checked'
    )
    showCheckboxItems(c)
  }
  printSolutionsTableView()
}
function updateCheckBoxListFromAction() {
  hideCheckboxItems()
  $('#alt-solution-list > li').remove()

  let resultList = new Set()
  let checkedList = []
  $(':checked').each(function () {
    checkedList.push($(this).attr('data-course-id'))
  })
  searchRes.res.forEach((a, index) => {
    if (checkedList.subsetTo(a)) {
      a.forEach((b) => resultList.add(b))
      if (a.subsetTo(checkedList)) {
        changeSolutionTo(index + 1)
      }
    }
  })
  for (let c of resultList) {
    showCheckboxItems(c)
  }
  printSolutionsTableView()
}
function deSelect() {
  $("tr>td>input[type='checkbox']").removeAttr('checked')
  $(`tr>td>input[type='checkbox']`).parent().parent().removeAttr('style')
}
function printSolutionsTableCheckable() {
  $('table.course-list > tbody >tr:gt(0)').remove()

  let selectionItems = searchRes.getSelectionItems()
  let cnt = 1
  for (let c of selectionItems) {
    addCheckboxCourse(c, cnt)
    cnt++
  }
  updateCheckBoxListFromSolution()

  clipboard = new ClipboardJS('.btn')
  clipboardAction(clipboard)
}
function printSolutionsTableView() {
  initTable()

  let checkedList = []
  $(':checked').each(function () {
    checkedList.push($(this).attr('data-course-id'))
  })
  for (let c of checkedList) {
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
  $('#input-submit').attr('disabled', 'disabled')

  searchRes = ''
  let list = $('#input-text')[0].value.trim().replace('，', ',').split(',')
  list = list.map((e) => e.trim())
  try {
    searchRes = new CourseSelect(list, courses)
    if (!searchRes) {
      window.alert('当前选择的课程没有可行的全选方案。')
      return
    }
    $('#search-box-full').attr('id', 'search-box')
    let res = searchRes.Select()
    if (!res) {
      window.alert('没有不冲突的选课方案..请尝试减少课程')
      throw new EXCEPTION('缺少方案', '没有不冲突的选课方案')
    }
    generateSolutionsList(res)
    $('.course-list').css('display', 'table')
    printSolutionsTableCheckable()
    printSolutionsTableView()
  } catch (e) {
    console.error(e)
  }
  $('#input-submit').removeAttr('disabled')

  // $('#output').text(a.print())
}
function initTable() {
  templete = document.querySelector('.table-view > div > table')
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
function clipboardAction(clipboard) {
  clipboard.on('success', function (e) {
    e.trigger.setAttribute('class', 'tooltip')
    $(e.trigger).append('<span class="tooltiptext">复制成功</span>')
    setTimeout(() => {
      e.trigger.setAttribute('class', 'btn')
      $(e.trigger).find('span').remove()
    }, 1000)
    e.clearSelection()
  })
}
function changeSolutionTo(num) {
  let currSolution = Number(
    $('[selected=selected]').attr('id').replace('solution', '')
  )
  $(`#solution${currSolution}`).attr('selected', false)
  $(`#solution${num}`).attr('selected', 'selected')
  $(`#solution${num}`)[0].scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
  updateCheckBoxListFromSolution()
}
function addCheckboxCourse(c, cnt) {
  let items = searchRes.data.get(c)
  let tr = `<tr id="course${cnt}" >
    <td><input data-course-id="${c}" type="checkbox" onchange="updateCheckBoxListFromAction()"></td>
    <td><button class="btn" data-title="copied" data-clipboard-text="${c}">${c}</button></td>
    <td><div class="course-td">${items.name}</div></td><td>${items.campus}</td>
    <td>${items.method}</td><td>${items.teacher}</td>
    <td>${items.gp}</td>
    <td>${items.slot}</td>
    <td class="last-column"><div class="course-td">${items.timeraw}</div></td><
    /tr>`
  $('table.course-list > tbody').append(tr)
}
function addAdditionalCourse(course) {
  let ttlCourse = searchRes.getSelectionItems().length + 1
  $(`tr#course${ttlCourse}`).remove() //cleanup
  printSolutionsTableView() //cleanup

  addCheckboxCourse(course, ttlCourse)
  $(`tr#course${ttlCourse} input`).attr('disabled', true)
  timelist = searchRes.data.get(course).time
  for (let t of timelist) {
    let [x, y, z] = t
    $(
      `[week=${x}] > tbody > tr:nth-child(${z + 1}) > td:nth-child(${y + 1})`
    ).text(searchRes.data.get(course).name)
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
    $('[week][style]').removeAttr('style')
    if (currWeek - 1 > 0) {
      $(`[week=${currWeek - 1}]`).css('display', 'table')
    } else $(`[week=${18}]`).css('display', 'table')
  }
  document.getElementById('page-after').onclick = () => {
    let currWeek = Number($('[week][style]').attr('week'))
    $('[week][style]').removeAttr('style')
    if (currWeek + 1 < 19) {
      $(`[week=${currWeek + 1}]`).css('display', 'table')
    } else $(`[week=${1}]`).css('display', 'table')
  }
  document.getElementById('avalible-common').onclick = () => {
    $('#alt-solution-list > li').remove()
    let checkedList = []
    $(':checked').each(function () {
      checkedList.push($(this).attr('data-course-id'))
    })
    let cnt = 0
    let list = searchRes.findAvalibleCommon(checkedList)
    for (let arg of list) {
      let name = searchRes.data.get(arg).name
      let li = `<li data=${arg} selected="false" id="alt-solution${cnt}"><button class="btn-add-course" onclick="addAdditionalCourse('${arg}')"> ${name}</button></li>`
      $('#alt-solution-list').append(li)
      cnt++
    }
    clipboard = new ClipboardJS('.btn')
    clipboardAction(clipboard)
  }
  document.getElementById('avalible-PE').onclick = () => {
    $('#alt-solution-list > li').remove()
    let checkedList = []
    $(':checked').each(function () {
      checkedList.push($(this).attr('data-course-id'))
    })
    let cnt = 0
    let list = searchRes.findAvaliblePE(checkedList)
    for (let arg of list) {
      let name = searchRes.data.get(arg).name
      let li = `<li data=${arg} selected="false" id="alt-solution${cnt}"><button class="btn-add-course" onclick="addAdditionalCourse('${arg}')"> ${name}</button></li>`
      $('#alt-solution-list').append(li)
      cnt++
    }
    clipboard = new ClipboardJS('.btn')
    clipboardAction(clipboard)
  }
})

Http.onreadystatechange = (e) => {
  if (Http.readyState === Http.LOADING) $('#loader').css('display', 'block')
  if (Http.readyState === Http.DONE) {
    $('#loader').css('display', 'none')
    courses = Http.responseText.split('\n').slice(1)
    courses.sort()
    $('#input-submit').removeAttr('disabled')
  }
}
