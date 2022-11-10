import { Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { useEffect, useState } from 'react'
import { useUserData } from '../../component/UserDataContext'
import './index.css'
interface TimetableDataType {
  key: number
  monday: String[]
  tuesday: String[]
  wednesday: String[]
  thursday: String[]
  friday: String[]
  saturday: String[]
  sunday: String[]
}
const parseTime = (times: string[]) => {
  let li: Array<number>[] = []
  for (const t of times) {
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
    week = timeSep[0].includes(',') ? timeSep[0].split(',') : [timeSep[0]]
    for (const wk of week) {
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
    } else z.push(timeSep[2])
    for (const i of x)
      for (const j of y)
        for (const k of z) li.push([Number(i), Number(j), Number(k)])
  }
  return li
}
const Now: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Array<TimetableDataType>>([])
  const { data: Coursedata, selection, setSelection } = useUserData()
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
    let j = 0
    Coursedata.forEach((row) => {
      if (selection.includes(row.key)) {
        const li = parseTime(row.courseTimes)
        li.forEach((element) => {
          switch (element[1]) {
            case 1:
              data[(element[0] - 1) * 12 + element[2] - 1].monday.push(row.name)
              break
            case 2:
              data[(element[0] - 1) * 12 + element[2] - 1].tuesday.push(
                row.name
              )
              break
            case 3:
              data[(element[0] - 1) * 12 + element[2] - 1].wednesday.push(
                row.name
              )
              break
            case 4:
              data[(element[0] - 1) * 12 + element[2] - 1].thursday.push(
                row.name
              )
              break
            case 5:
              data[(element[0] - 1) * 12 + element[2] - 1].friday.push(row.name)
              break
            case 6:
              data[(element[0] - 1) * 12 + element[2] - 1].saturday.push(
                row.name
              )
              break
            case 7:
              data[(element[0] - 1) * 12 + element[2] - 1].sunday.push(row.name)
              break
            default:
              break
          }
        })
      }
      if (++j === Coursedata.length) {
        setLoading(false)
        setData([...data])
      }
    })
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

  const getColor = (str: string) =>
    str
      ? colorArr[
          (str.length + str.charCodeAt(str.charCodeAt(0) % str.length)) %
            colorArr.length
        ]
      : 'orange'
  const tagStyle = {
    fontSize: '12px',
    lineHeight: '20px',
    margin: '2px 0 ',
    padding: '0 5px',
    border: '1px solid #d9d9d9',
    borderRadius: '2px',
    transition: 'all 0.3s',
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
      width: '19%',
      render: (_, { monday }) => (
        <span>
          {monday.map((a) => {
            return (
              <div
                className={'ant-tag-' + getColor(a.toString())}
                style={{ ...tagStyle }}
              >
                {a}
              </div>
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
      width: '19%',
      render: (_, { tuesday }) => (
        <span>
          {tuesday.map((a) => {
            return (
              <div
                className={'ant-tag-' + getColor(a.toString())}
                style={{ ...tagStyle }}
              >
                {a}
              </div>
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
      width: '19%',
      render: (_, { wednesday }) => (
        <span>
          {wednesday.map((a) => {
            return (
              <div
                className={'ant-tag-' + getColor(a.toString())}
                style={{ ...tagStyle }}
              >
                {a}
              </div>
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
      width: '19%',
      render: (_, { thursday }) => (
        <span>
          {thursday.map((a) => {
            return (
              <div
                className={'ant-tag-' + getColor(a.toString())}
                style={{ ...tagStyle }}
              >
                {a}
              </div>
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
      width: '19%',
      render: (_, { friday }) => (
        <span>
          {friday.map((a) => {
            return (
              <div
                className={'ant-tag-' + getColor(a.toString())}
                style={{ ...tagStyle }}
              >
                {a}
              </div>
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
            return (
              <div
                className={'ant-tag-' + getColor(a.toString())}
                style={{ ...tagStyle }}
              >
                {a}
              </div>
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
            return (
              <div
                className={'ant-tag-' + getColor(a.toString())}
                style={{ ...tagStyle }}
              >
                {a}
              </div>
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
