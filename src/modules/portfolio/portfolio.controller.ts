import type UserRepository from "../user/user.repository.js";

export default class PortfolioController {
    constructor(private readonly userRepository: UserRepository) {}

    public async getPortfolio(userid: string) {
        const res = this.userRepository.getUserPortfolio(userid);
        return res;
    }
}