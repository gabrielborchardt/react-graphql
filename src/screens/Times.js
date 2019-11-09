import React, { useState, useEffect } from 'react'
import { Table, Button } from 'antd';
import ModalRegisterTime from '../components/ModalRegisterTime';
import { useQuery, useSubscription } from 'react-apollo';
import gql from 'graphql-tag';

const user = JSON.parse(localStorage.getItem('user'))
const isAdmin =  user && user.role === 'ADMIN'

const columns = isAdmin ? [
    {
        title: 'Profissional',
        dataIndex: 'user.name',
        key: 'title',
    },
    {
        title: 'Data',
        dataIndex: 'date_registered',
        key: 'date_registered',
    },    
    {
        title: 'Hora',
        dataIndex: 'time_registered',
        key: 'time_registered',
    },
] 
: 
[
    {
        title: 'Data',
        dataIndex: 'date_registered',
        key: 'date_registered',
    },    
    {
        title: 'Hora',
        dataIndex: 'time_registered',
        key: 'time_registered',
    },
] 
;

console.log(columns);

export default function Times() {
    const [active, setActive] = useState(false)

    let query = isAdmin ? 
    gql`
        query allRegisteredTimes{
            allRegisteredTimes{
                id
                date_registered
                time_registered
                user{
                    id
                    name
                    email
                }
            }
        }
    `
    :
    gql`
        query allRegisteredTimes{
            allRegisteredTimes(userId: "${user && user.id}"){
                id
                date_registered
                time_registered
                user{
                    id
                    name
                    email
                }
            }
        }
    `

    const { data, loading, refetch, updateQuery } = useQuery(query)
    
    useSubscription(gql`
        subscription{
            onCreatedTime{
                id
                date_registered
                time_registered
                user{
                    id
                    name
                    email
                }                
            }
        }
    `, {
        onSubscriptionData({ subscriptionData }){
            updateQuery((prev) => {
                if(!subscriptionData.data || !isAdmin){
                    return prev
                }

                return Object.assign({}, prev, {
                    allRegisteredTimes: [
                        ...prev.allRegisteredTimes,
                        subscriptionData.data.onCreatedTime
                    ]
                })
            })
        }
    })

    useEffect(() => {
        refetch()
    }, [active, refetch])

    return (
        isAdmin ? 
        <>
            <Table dataSource={data && data.allRegisteredTimes} loading={loading} columns={columns} pagination={false} />
            <ModalRegisterTime active={active} setActive={setActive} />
        </>
        :
        <>
            <Button type="primary" onClick={() => setActive(true)} style={{ marginBottom: 16 }}>
                Adicionar
            </Button>
            <Table dataSource={data && data.allRegisteredTimes} loading={loading} columns={columns} pagination={false} />
            <ModalRegisterTime active={active} setActive={setActive} />
        </>
    )
}
