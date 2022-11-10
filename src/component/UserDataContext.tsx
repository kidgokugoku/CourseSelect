import axios from 'axios'
import {
  createContext,
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useContext,
  useEffect,
  useState,
} from 'react'

interface DataType {
  key: string
  name: string
  campus: string
  method: string
  gradePoint: number
  hours: number
  slots: number
  courseType: string
  teacherNames: string[]
  courseTimes: string[]
}

const UserDataContext = createContext({
  data: [
    {
      key: '',
      name: '',
      campus: '',
      method: '',
      gradePoint: 0,
      hours: 0,
      slots: 0,
      courseType: '',
      teacherNames: [''],
      courseTimes: [''],
    },
  ],
  selection: [''],
  setSelection: (selection: any) => {},
})

export const useUserData = () => useContext(UserDataContext)

export const UserDataProvider = (props: {
  children:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment
    | ReactPortal
    | null
    | undefined
}) => {
  const [data, setData] = useState<Array<DataType>>([])
  const [selection, setSelection] = useState<Array<string>>([])
  const userData = {
    data,
    selection,
    setSelection,
  }

  useEffect(() => {
    axios
      .get('/db.json')
      //   .get('/db.csv')
      //   .then((res) => {
      //     Papa.parse(res.data, {
      //       complete: function (results) {
      //         const res = results.data
      //         res.slice(1).forEach((row) => {
      //           const tmp = {
      //             key: row[0],
      //             name: row[1],
      //             campus: row[2],
      //             method: row[3],
      //             teacherNames: [row[4]],
      //             gradePoint: row[5],
      //             hours: row[6],
      //             slots: row[7],
      //             courseType: row[8],
      //             courseTimes: [row[9]],
      //           }
      //           const a = ['虚拟课程(研究生)', '虚拟课程(排课用)']
      //           if (
      //             !a.includes(tmp.name) &&
      //             !data.find((element) => element.key === tmp.key) &&
      //             tmp.key
      //           ) {
      //             data.push(tmp)
      //           }
      //         })
      //       },
      //     })
      //     data.forEach((row) => {
      //       //   const name: string = row.name
      //       //   if (!names.includes(name)) {
      //       //     names.push(name)
      //       //     options.push({
      //       //       label: name,
      //       //       value: name,
      //       //     })
      //       //   }
      //       row.courseTimes = row.courseTimes.map((x) =>
      //         x in row.courseTimes ? '' : x
      //       )
      //       row.teacherNames =
      //         row.teacherNames[0] !== undefined
      //           ? row.teacherNames[0].includes('_')
      //             ? [row.teacherNames[0].split('_')[0]]
      //             : row.teacherNames[0].split(' ')
      //           : row.teacherNames
      //       row.courseTimes =
      //         row.courseTimes[0] !== undefined
      //           ? row.courseTimes[0].split(';')
      //           : row.courseTimes
      //     })
      //   })
      .then((res) => {
        // console.log(res)
        setData(res.data)
        // setLoading(false)
        // console.log(JSON.stringify(res.data))
      })

    setSelection(localStorage.getItem('selection')?.split(';') || [])
  }, [])

  return (
    <UserDataContext.Provider value={userData}>
      {props.children}
    </UserDataContext.Provider>
  )
}
