import { Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { useEffect, useState } from 'react'
import { useUserData } from '../../component/UserDataContext'
import './index.scss'
interface TimetableDataType {
  key: number
  monday: { text: string; courseId: string }[]
  tuesday: { text: string; courseId: string }[]
  wednesday: { text: string; courseId: string }[]
  thursday: { text: string; courseId: string }[]
  friday: { text: string; courseId: string }[]
  saturday: { text: string; courseId: string }[]
  sunday: { text: string; courseId: string }[]
}
const parseTime = (row: CourseType) => {
  let li: { week: number; weekday: number; course: number; room: string }[] = []
  for (const i in row.courseTimes) {
    const t = row.courseTimes[i]
    const room = row.classrooms[i] ? row.classrooms[i] : ''
    if (t.replace(/\d+\-\d+周/i, '') === '') return []
    let timeFULL = t.replace(
      /([0-9,\-]+)周 (.)\((\d+(-\d+)?)节\)(.*)/i,
      '$1;$2;$3;$4;$5'
    )
    let timeSep = timeFULL.split(';')
    let x: number[] = []
    let y = []
    let z = []
    //week
    let week, a, b
    week = timeSep[0].includes(',') ? timeSep[0].split(',') : [timeSep[0]]
    for (const wk of week) {
      if (!wk.includes('-')) x.push(Number(wk))
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

    //days
    y = [timeSep[1]]
    y = y.map((item) =>
      item === '一'
        ? 1
        : item === '二'
        ? 2
        : item === '三'
        ? 3
        : item === '四'
        ? 4
        : item === '五'
        ? 5
        : item === '六'
        ? 6
        : 7
    )
    //c
    if (timeSep[3]) {
      const cls = timeSep[2]
      const [c, d] = cls.split('-')
      for (let iz = Number(c); iz < Number(d) + 1; iz++) z.push(iz)
    } else z.push(Number(timeSep[2]))
    for (const i of x)
      for (const j of y)
        for (const k of z)
          li.push({ week: i, weekday: j, course: k, room: room })
  }
  return li
}
const Now: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Array<TimetableDataType>>([])
  const { data: Coursedata, selection } = useUserData()
  const currentSelection: CourseType[] = []
  const [disableSelection, setdisableSelection] = useState<Array<string>>([])
  useEffect(() => {
    if (!loading) return
    if (data.length !== 0) return
    if (Coursedata.length === 0) return
    for (let i = 0; i < 12 * 20; i++) {
      data.push({
        key: i,
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      })
    }
    Coursedata.forEach((row) => {
      if (selection.includes(row.key)) {
        currentSelection.push(row)
      }
    })
    updateTableData()
  }, [Coursedata])
  const colorArr = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'lime',
    'cyan',
    'blue',
    'geekblue',
  ]
  const updateTableData = () => {
    let j = 0
    currentSelection.forEach((row) => {
      const timeRes = parseTime(row)
      timeRes.forEach((element) => {
        switch (element.weekday) {
          case 1:
            data[(element.week - 1) * 12 + element.course - 1].monday.push({
              text: `${row.name}@${element.room}`,
              courseId: row.key,
            })
            break
          case 2:
            data[(element.week - 1) * 12 + element.course - 1].tuesday.push({
              text: `${row.name}@${element.room}`,
              courseId: row.key,
            })
            break
          case 3:
            data[(element.week - 1) * 12 + element.course - 1].wednesday.push({
              text: `${row.name}@${element.room}`,
              courseId: row.key,
            })
            break
          case 4:
            data[(element.week - 1) * 12 + element.course - 1].thursday.push({
              text: `${row.name}@${element.room}`,
              courseId: row.key,
            })
            break
          case 5:
            data[(element.week - 1) * 12 + element.course - 1].friday.push({
              text: `${row.name}@${element.room}`,
              courseId: row.key,
            })
            break
          case 6:
            data[(element.week - 1) * 12 + element.course - 1].saturday.push({
              text: `${row.name}@${element.room}`,
              courseId: row.key,
            })
            break
          case 7:
            data[(element.week - 1) * 12 + element.course - 1].sunday.push({
              text: `${row.name}@${element.room}`,
              courseId: row.key,
            })
            break
          default:
            break
        }
        if (++j === currentSelection.length) {
          setLoading(false)
          setData([...data])
        }
      })
    })
  }
  const getColor = (str: string) =>
    str
      ? colorArr[(str.length * str.charCodeAt(0)) % colorArr.length]
      : 'orange'
  const courseOnClick = (id: string) => {
    if (disableSelection.includes(id)) {
      disableSelection.splice(disableSelection.indexOf(id), 1)
    } else disableSelection.push(id)
    setData([...data])
  }
  const columns: ColumnsType<TimetableDataType> = [
    {
      title: <></>,
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      render: (_, { key }) => <span>{(key % 12) + 1}</span>,
    },
    {
      title: '一',
      dataIndex: 'monday',
      key: 'monday',
      align: 'center',

      render: (_, { monday }) => (
        <span>
          {monday.map((a) => {
            const cls = disableSelection.includes(a.courseId)
              ? 'course-tag'
              : 'ant-tag-' + getColor(a.text.toString()) + ' course-tag'
            return (
              <button
                style={{ cursor: 'pointer' }}
                className={cls}
                onClick={() => courseOnClick(a.courseId)}
              >
                {a.text}
              </button>
            )
          })}
        </span>
      ),
    },
    {
      title: '二',
      dataIndex: 'tuesday',
      key: 'tuesday',
      align: 'center',

      render: (_, { tuesday, key }) => (
        <span>
          {tuesday.map((a) => {
            const cls = disableSelection.includes(a.courseId)
              ? 'course-tag'
              : 'ant-tag-' + getColor(a.text.toString()) + ' course-tag'
            return (
              <button
                style={{ cursor: 'pointer' }}
                className={cls}
                onClick={() => courseOnClick(a.courseId)}
              >
                {a.text}
              </button>
            )
          })}
        </span>
      ),
    },
    {
      title: '三',
      dataIndex: 'wednesday',
      key: 'wednesday',
      align: 'center',

      render: (_, { wednesday }) => (
        <span>
          {wednesday.map((a) => {
            const cls = disableSelection.includes(a.courseId)
              ? 'course-tag'
              : 'ant-tag-' + getColor(a.text.toString()) + ' course-tag'
            return (
              <button
                style={{ cursor: 'pointer' }}
                className={cls}
                onClick={() => courseOnClick(a.courseId)}
              >
                {a.text}
              </button>
            )
          })}
        </span>
      ),
    },
    {
      title: '四',
      dataIndex: 'thursday',
      key: 'thursday',
      align: 'center',

      render: (_, { thursday }) => (
        <span>
          {thursday.map((a) => {
            const cls = disableSelection.includes(a.courseId)
              ? 'course-tag'
              : 'ant-tag-' + getColor(a.text.toString()) + ' course-tag'
            return (
              <button
                style={{ cursor: 'pointer' }}
                className={cls}
                onClick={() => courseOnClick(a.courseId)}
              >
                {a.text}
              </button>
            )
          })}
        </span>
      ),
    },
    {
      title: '五',
      dataIndex: 'friday',
      key: 'friday',
      align: 'center',

      render: (_, { friday }) => (
        <span>
          {friday.map((a) => {
            const cls = disableSelection.includes(a.courseId)
              ? 'course-tag'
              : 'ant-tag-' + getColor(a.text.toString()) + ' course-tag'
            return (
              <button
                style={{ cursor: 'pointer' }}
                className={cls}
                onClick={() => courseOnClick(a.courseId)}
              >
                {a.text}
              </button>
            )
          })}
        </span>
      ),
    },
    {
      title: '六',
      dataIndex: 'saturday',
      key: 'saturday',
      align: 'center',
      render: (_, { saturday }) => (
        <span>
          {saturday.map((a) => {
            const cls = disableSelection.includes(a.courseId)
              ? 'course-tag'
              : 'ant-tag-' + getColor(a.text.toString()) + ' course-tag'
            return (
              <button
                style={{ cursor: 'pointer' }}
                className={cls}
                onClick={() => courseOnClick(a.courseId)}
              >
                {a.text}
              </button>
            )
          })}
        </span>
      ),
    },
    {
      title: '日',
      dataIndex: 'sunday',
      key: 'sunday',
      align: 'center',
      render: (_, { sunday }) => (
        <span>
          {sunday.map((a) => {
            const cls = disableSelection.includes(a.courseId)
              ? 'course-tag'
              : 'ant-tag-' + getColor(a.text.toString()) + ' course-tag'
            return (
              <button
                style={{ cursor: 'pointer' }}
                className={cls}
                onClick={() => courseOnClick(a.courseId)}
              >
                {a.text}
              </button>
            )
          })}
        </span>
      ),
    },
  ]

  return !loading ? (
    <Table
      size="large"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={{
        defaultPageSize: 12,
        showSizeChanger: false,
        position: ['topRight', 'bottomRight'],
      }}
    ></Table>
  ) : (
    <Table
      loading={loading}
      columns={columns}
      pagination={{
        defaultPageSize: 12,
        showSizeChanger: false,
        position: ['topRight', 'bottomRight'],
      }}
    ></Table>
  )
}

export default Now
