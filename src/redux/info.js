
const initialState = { info: {} }

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case "INFO":
            return { ...state, INFO: action.data };
        default: return state;
    }
}

export default reducer;