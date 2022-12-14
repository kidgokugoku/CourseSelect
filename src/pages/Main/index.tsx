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
  const { innerWidth } = window
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
    if (innerWidth <= 575)
      setFilteredInfo({
        key: filters.key ? filters.key : filteredInfo.key,
        courseType: filters.courseType?.length
          ? filters.courseType
          : filteredInfo.courseType,
        name: filteredInfo.name,
        campus: filters.campus?.length ? filters.campus : filteredInfo.campus,
      })
    else
      setFilteredInfo({
        key: filters.key ? filters.key : filteredInfo.key,
        courseType: filters.courseType?.length
          ? filters.courseType
          : ['Specialty', 'PublicBasic', 'Common'],
        name: filteredInfo.name,
        campus: filters.campus?.length
          ? filters.campus
          : ['????????????', '????????????', '???????????????'],
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
  const getColor = (text: string) =>
    text ? colorArr[text.length % colorArr.length] : 'orange'
  const makeColoredTag = (text: string) => (
    <Tag color={getColor(text)} key={text}>
      {text}
    </Tag>
  )
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
            <Radio.Button>??????</Radio.Button>
            <Radio.Button value="Specialty">?????????</Radio.Button>
            <Radio.Button value="PublicBasic">???????????????</Radio.Button>
            <Radio.Button value="Common">?????????</Radio.Button>
          </Radio.Group>
          <Radio.Group
            onChange={(e) => {
              filteredInfo.campus = e.target.value ? [e.target.value] : []
              setFilteredInfo({ ...filteredInfo })
            }}
          >
            <Radio.Button>??????</Radio.Button>
            <Radio.Button value="????????????">????????????</Radio.Button>
            <Radio.Button value="????????????">????????????</Radio.Button>
            <Radio.Button value="???????????????">???????????????</Radio.Button>
          </Radio.Group>
          <div>??????</div>
        </>
      ),
      render: (record) => {
        const courseType =
          record.courseType === 'Specialty'
            ? '?????????'
            : record.courseType === 'PublicBasic'
            ? '???????????????'
            : '?????????'
        return (
          <>
            <Button
              size="small"
              type="text"
              onClick={() => onClickCopy(record.key)}
            >
              {makeColoredTag(record.key)}
              {makeColoredTag(record.name)}
            </Button>
            <p>
              ??????: {record.gradePoint} ??????: {record.slots}
            </p>
            <Tag color={getColor(record.courseType)} key={record.courseType}>
              {courseType}
            </Tag>
            {makeColoredTag(record.campus)}
            {record.teacherNames.map((teacherName: string) => {
              return makeColoredTag(teacherName)
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
      title: '?????????',
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
      title: '??????',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: '14rem',
      responsive: ['sm'],
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.name === value,
      render: (_, { name }) => {
        return makeColoredTag(name)
      },
    },
    {
      title: '????????????',
      dataIndex: 'method',
      key: 'method',
      align: 'center',
      responsive: ['lg'],
      filteredValue: null,
    },
    {
      title: '??????',
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
      title: '??????',
      dataIndex: 'hours',
      key: 'hours',
      align: 'center',
      responsive: ['lg'],
      filteredValue: null,
      sorter: (a, b) => a.hours - b.hours,
      sortOrder: sortedInfo.columnKey === 'hours' ? sortedInfo.order : null,
    },
    {
      title: '????????????',
      dataIndex: 'slots',
      key: 'slots',
      align: 'center',
      responsive: ['sm'],
      filteredValue: null,
      sorter: (a, b) => a.slots - b.slots,
      sortOrder: sortedInfo.columnKey === 'slots' ? sortedInfo.order : null,
    },
    {
      title: '????????????',
      dataIndex: 'courseType',
      key: 'courseType',
      responsive: ['sm'],
      filters: [
        {
          text: '?????????',
          value: 'Specialty',
        },
        {
          text: '???????????????',
          value: 'PublicBasic',
        },
        {
          text: '?????????',
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
            ? '?????????'
            : courseType === 'PublicBasic'
            ? '???????????????'
            : '?????????'
        return (
          <Tag color={color} key={courseType}>
            {text}
          </Tag>
        )
      },
    },
    {
      title: '????????????',
      dataIndex: 'campus',
      key: 'campus',
      responsive: ['sm'],
      filters: [
        {
          text: '????????????',
          value: '????????????',
        },
        {
          text: '????????????',
          value: '????????????',
        },
        {
          text: '???????????????',
          value: '???????????????',
        },
      ],
      filteredValue: filteredInfo.campus || null,
      onFilter: (value, record) => record.campus === value,
      render: (_, { campus }) => {
        const color =
          campus === '????????????'
            ? 'volcano'
            : campus === '????????????'
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
      title: '????????????',
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
      title: '????????????',
      dataIndex: 'classrooms',
      key: 'classrooms',
      align: 'center',
      responsive: ['sm'],
      filteredValue: null,
      render: (classrooms) => (
        <span>
          {classrooms.map((classroom: string, index: number) => {
            return makeColoredTag(classroom)
          })}
        </span>
      ),
    },
    {
      title: '????????????',
      dataIndex: 'courseTimes',
      key: 'courseTimes',
      align: 'center',
      responsive: ['sm'],
      filteredValue: null,
      render: (courseTimes) => (
        <span>
          {courseTimes.map((courseTime: string) => {
            return makeColoredTag(courseTime)
          })}
        </span>
      ),
    },

    {
      title: (
        <Switch
          checkedChildren="??????"
          unCheckedChildren="??????"
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
            ????????????
          </Button>
        ) : (
          <Button
            className="btn-select"
            onClick={() => {
              confirmSelection(key)
            }}
          >
            ????????????
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
          placeholder="???????????????"
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
