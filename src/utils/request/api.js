import {get,post,deleted,put} from './http'

// Login
export function login(data) {
	return post("/im/login", data)
}

// Regist
export function register(data) {
	return post('/im/register',data)
}

