import {
  Button,
  Input,
  Layout,
  Radio,
  Select,
  SelectProps,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd'
import { ColumnsType, TableProps } from 'antd/lib/table'
import { FilterValue, SorterResult } from 'antd/lib/table/interface'
import copy from 'copy-to-clipboard'
import { useEffect, useState } from 'react'
import { useUserData } from '../../component/UserDataContext'
import './index.scss'

const onClickCopy = (value: string) => copy(value)

const names: string[] = []
const options: SelectProps['options'] = []

const Main: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const confirmDeselection: Function = (key: string) => {
    selection.splice(selection.indexOf(key), 1)
    setSelection([...selection])
  }

  const { data, selection, setSelection } = useUserData()

  const confirmSelection: Function = (key: string) => {
    setSelection([...selection, key])
  }

  useEffect(() => {
    if (selection.length) localStorage.setItem('selection', selection.join(';'))
  }, [selection])

  useEffect(() => {
    let i = 0
    data.forEach((row) => {
      const name: string = row.name
      if (!names.includes(name)) {
        names.push(name)
        options.push({
          label: name,
          value: name,
        })
      }
      if (++i === data.length) {
        setLoading(false)
        // console.log(JSON.stringify(data))
      }
    })
  }, [data])

  const [filterSelected, setFilterSelected] = useState(false)
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({ key: [], name: [], courseType: [], campus: [] })
  const [sortedInfo, setSortedInfo] = useState<SorterResult<CourseType>>({})

  const handleChange: TableProps<CourseType>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    setFilteredInfo({
      key: filters.key ? filters.key : filteredInfo.key,
      courseType: filters.courseType
        ? filters.courseType
        : ['Specialty', 'PublicBasic', 'Common'],
      name: filteredInfo.name,
      campus: filters.campus
        ? filters.campus
        : ['崂山校区', '鱼山校区', '西海岸校区'],
    })
    setSortedInfo(sorter as SorterResult<CourseType>)
  }
  const onSearch = (value: any) => {
    filteredInfo.name = value
    setFilteredInfo({ ...filteredInfo })
  }
  const onSearchKey = (value: any) => {
    filteredInfo.key = value !== '' ? [value] : []
    setFilteredInfo({ ...filteredInfo })
  }
  useEffect(() => {
    filteredInfo.key = filterSelected ? selection : []
    setFilteredInfo({ ...filteredInfo })
  }, [filterSelected])
  const colorArr = [
    'lime',
    'magenta',
    'red',
    'blue',
    'volcano',
    'geekblue',
    'gold',
    'cyan',
    'orange',
  ]
  const getColor = (str: string) =>
    str ? colorArr[str.length % colorArr.length] : 'orange'
  const columns: ColumnsType<CourseType> = [
    {
      title: (
        <>
          <Radio.Group
            onChange={(e) => {
              filteredInfo.courseType = e.target.value ? [e.target.value] : []
              setFilteredInfo({ ...filteredInfo })
            }}
          >
            <Radio.Button>全部</Radio.Button>
            <Radio.Button value="Specialty">专业课</Radio.Button>
            <Radio.Button value="PublicBasic">公共基础课</Radio.Button>
            <Radio.Button value="Common">通识课</Radio.Button>
          </Radio.Group>
          <Radio.Group
            onChange={(e) => {
              filteredInfo.campus = e.target.value ? [e.target.value] : []
              setFilteredInfo({ ...filteredInfo })
            }}
          >
            <Radio.Button>全部</Radio.Button>
            <Radio.Button value="崂山校区">崂山校区</Radio.Button>
            <Radio.Button value="鱼山校区">鱼山校区</Radio.Button>
            <Radio.Button value="西海岸校区">西海岸校区</Radio.Button>
          </Radio.Group>
          <div>课程</div>
        </>
      ),
      render: (record) => {
        const courseType =
          record.courseType === 'Specialty'
            ? '专业课'
            : record.courseType === 'PublicBasic'
            ? '公共基础课'
            : '通识课'
        return (
          <>
            <Button
              size="small"
              type="text"
              onClick={() => onClickCopy(record.key)}
            >
              <Tag color={getColor(record.key)} key={record.key}>
                {record.key}
              </Tag>
              <Tag color={getColor(record.name)} key={record.name}>
                {record.name}
              </Tag>
            </Button>
            <p>
              学分: {record.gradePoint} 可选: {record.slots}
            </p>
            <Tag color={getColor(record.courseType)} key={record.courseType}>
              {courseType}
            </Tag>
            <Tag color={getColor(record.campus)} key={record.campus}>
              {record.campus}
            </Tag>
            {record.teacherNames.map((teacherName: string) => {
              return (
                <Tag color={getColor(teacherName)} key={teacherName}>
                  {teacherName}
                </Tag>
              )
            })}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexFlow: 'row wrap',
              }}
            >
              {record.courseTimes.map((courseTime: string, index: number) => {
                return (
                  <Tag color={colorArr[index]} key={courseTime}>
                    {courseTime}
                  </Tag>
                )
              })}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexFlow: 'row wrap',
              }}
            >
              {record.classrooms.map((classroom: string, index: number) => {
                return (
                  <Tag color={colorArr[index]} key={classroom + index}>
                    {classroom}
                  </Tag>
                )
              })}
            </div>
          </>
        )
      },
      responsive: ['xs'],
      align: 'center',
      filteredValue: filteredInfo.key?.length
        ? filteredInfo.key
        : filteredInfo.name?.length
        ? filteredInfo.name
        : filteredInfo.courseType?.length
        ? filteredInfo.courseType
        : filteredInfo.campus || null,
      onFilter: (value, record) =>
        (!filteredInfo.courseType?.length ||
          filteredInfo.courseType?.includes(record.courseType)) &&
        (!filteredInfo.campus?.length ||
          filteredInfo.campus?.includes(record.campus)) &&
        (record.name === value ||
          record.key === value ||
          record.courseType === value ||
          record.campus === value),
    },
    {
      title: '选课号',
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      responsive: ['lg'],
      filterDropdown: (
        <Input
          id="KeyInput"
          allowClear
          onChange={(e) => onSearchKey(e.target.value)}
        />
      ),
      filteredValue: filteredInfo.key || null,
      onFilter: (value, record) => {
        return filterSelected
          ? selection.includes(record.key)
          : record.key.includes(value.toString())
      },
      render: (_, { key }) => {
        return (
          <Button size="small" type="text" onClick={() => onClickCopy(key)}>
            {key}
          </Button>
        )
      },
    },
    {
      title: '课程',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: '14rem',
      responsive: ['sm'],
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.name === value,
      render: (_, { name }) => {
        return (
          <Tag color={getColor(name)} key={name}>
            {name}
          </Tag>
        )
      },
    },
    {
      title: '授课方式',
      dataIndex: 'method',
      key: 'method',
      align: 'center',
      responsive: ['lg'],
      filteredValue: null,
    },
    {
      title: '学分',
      dataIndex: 'gradePoint',
      key: 'gradePoint',
      align: 'center',
      responsive: ['lg'],
      filteredValue: null,
      sorter: (a, b) => a.gradePoint - b.gradePoint,
      sortOrder:
        sortedInfo.columnKey === 'gradePoint' ? sortedInfo.order : null,
    },
    {
      title: '学时',
      dataIndex: 'hours',
      key: 'hours',
      align: 'center',
      responsive: ['lg'],
      filteredValue: null,
      sorter: (a, b) => a.hours - b.hours,
      sortOrder: sortedInfo.columnKey === 'hours' ? sortedInfo.order : null,
    },
    {
      title: '可选人数',
      dataIndex: 'slots',
      key: 'slots',
      align: 'center',
      responsive: ['sm'],
      filteredValue: null,
      sorter: (a, b) => a.slots - b.slots,
      sortOrder: sortedInfo.columnKey === 'slots' ? sortedInfo.order : null,
    },
    {
      title: '课程类型',
      dataIndex: 'courseType',
      key: 'courseType',
      responsive: ['sm'],
      filters: [
        {
          text: '专业课',
          value: 'Specialty',
        },
        {
          text: '公共基础课',
          value: 'PublicBasic',
        },
        {
          text: '通识课',
          value: 'Common',
        },
      ],
      filteredValue: filteredInfo.courseType || null,
      onFilter: (value, record) => record.courseType === value,
      render: (_, { courseType }) => {
        const color =
          courseType === 'Specialty'
            ? 'volcano'
            : courseType === 'PublicBasic'
            ? 'green'
            : 'geekblue'
        const text =
          courseType === 'Specialty'
            ? '专业课'
            : courseType === 'PublicBasic'
            ? '公共基础课'
            : '通识课'
        return (
          <Tag color={color} key={courseType}>
            {text}
          </Tag>
        )
      },
    },
    {
      title: '上课校区',
      dataIndex: 'campus',
      key: 'campus',
      responsive: ['sm'],
      filters: [
        {
          text: '崂山校区',
          value: '崂山校区',
        },
        {
          text: '鱼山校区',
          value: '鱼山校区',
        },
        {
          text: '西海岸校区',
          value: '西海岸校区',
        },
      ],
      filteredValue: filteredInfo.campus || null,
      onFilter: (value, record) => record.campus === value,
      render: (_, { campus }) => {
        const color =
          campus === '崂山校区'
            ? 'volcano'
            : campus === '鱼山校区'
            ? 'green'
            : 'geekblue'
        return (
          <Tag color={color} key={campus}>
            {campus}
          </Tag>
        )
      },
    },
    {
      title: '授课老师',
      dataIndex: 'teacherNames',
      key: 'teacherNames',
      align: 'center',
      width: '3rem',
      responsive: ['sm'],
      filteredValue: null,
      render: (_, { teacherNames }) => (
        <span>
          {teacherNames.map((teacherName: string) => {
            return (
              <Tag color={getColor(teacherName)} key={teacherName}>
                {teacherName}
              </Tag>
            )
          })}
        </span>
      ),
    },
    {
      title: '上课时间',
      dataIndex: 'classrooms',
      key: 'classrooms',
      align: 'center',
      responsive: ['sm'],
      filteredValue: null,
      render: (classrooms) => (
        <span>
          {classrooms.map((classroom: string, index: number) => {
            return (
              <Tag color={getColor(classroom)} key={classroom + index}>
                {classroom}
              </Tag>
            )
          })}
        </span>
      ),
    },
    {
      title: '上课时间',
      dataIndex: 'courseTimes',
      key: 'courseTimes',
      align: 'center',
      responsive: ['sm'],
      filteredValue: null,
      render: (courseTimes) => (
        <span>
          {courseTimes.map((courseTime: string) => {
            return (
              <Tag color={getColor(courseTime)} key={courseTime}>
                {courseTime}
              </Tag>
            )
          })}
        </span>
      ),
    },

    {
      title: (
        <Switch
          checkedChildren="已选"
          unCheckedChildren="未选"
          onClick={() => {
            setFilterSelected(!filterSelected)
          }}
        />
      ),
      key: 'isSeleted',
      fixed: 'right',
      align: 'center',
      filteredValue: null,
      render: (_, { key }) => {
        return selection.includes(key) ? (
          <Button
            className="btn-select"
            onClick={() => {
              confirmDeselection(key)
            }}
          >
            取消选择
          </Button>
        ) : (
          <Button
            className="btn-select"
            onClick={() => {
              confirmSelection(key)
            }}
          >
            选择课程
          </Button>
        )
      },
    },
  ]

  return !loading ? (
    <Layout>
      <Space style={{ padding: '1rem 0' }}>
        <Select
          size="large"
          mode="multiple"
          autoClearSearchValue={false}
          allowClear
          placeholder="输入课程名"
          style={{ width: '24rem' }}
          onChange={onSearch}
          options={options}
          disabled={loading}
        />
      </Space>
      <Table
        onChange={handleChange}
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 20,
          pageSizeOptions: [10, 20, 50, 100],
          position: ['topRight', 'bottomRight'],
        }}
      ></Table>
    </Layout>
  ) : (
    <Layout>
      <Space style={{ padding: '1rem 0' }}>
        <Select style={{ width: '24rem' }} disabled={loading} />
      </Space>
      <Table
        columns={columns}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          position: ['topRight', 'bottomRight'],
        }}
      ></Table>
    </Layout>
  )
}
export default Main
