class User {
    constructor(id, name, email, major, semester, birthday, photo) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.major = major;
        this.semester = semester;
        this.birthday = birthday;
        this.photo = photo;
    }

    static fromForm({ id, name, email, major, semester, birthday, photo }) {
        return new User(id, name, email, major, semester, birthday, photo);
    }
}

module.exports = User;
