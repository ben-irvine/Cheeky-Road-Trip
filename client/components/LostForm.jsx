import React from 'react'
import { saveLost } from '../apis/lostpets'

class LostForm extends React.Component {

    state = {
        lost: {
            user_id: "TBC",
            name: "",
            species: "",
            photo: ""
        }
    }

    handleChange = (evt) => {
        this.setState({
            lost: {
                ...this.state.lost,
                [evt.target.name]: evt.target.value
            }
        })
    }

    handleSubmit = (evt) => {
        evt.preventDefault()
        saveLost(this.state.lost)
            .then(id => {
                console.log(id)
                // Need to get all lost pets again and redirect to lost page showing addition
            })
    }

    render() {
        return (
            <>
                <h3>ADD A LOST PET</h3>
                <form>
                    <label htmlFor="name">Name:</label>
                    <input type="text" name="name" onChange={this.handleChange} />
                    <label htmlFor="species">Species:</label>
                    <input type="text" name="species" onChange={this.handleChange} />
                    <label htmlFor="photo">Photo:</label>
                    <input type="text" name="photo" onChange={this.handleChange} />
                    <button onClick={this.handleSubmit}>Add lost pet</button>
                </form>
            </>
        )
    }

}

export default LostForm