

export interface IAdminRepository{
    findAdmin(email:string):Promise<any>
    createAdmin(email:string,password:string):Promise<any>
    fetchAllUsers():Promise<any>
    saveSpecialization({name,description,image}:{name:string,description:string,image:string|null}):Promise<any>
    getAllSpecializations():Promise<any>
    saveupdatespecialization(name:string,description:string,specializationId:string,imageUrl:string):Promise<any>
    blockUnblockUser(user_id:string,userState:boolean):Promise<any>
    fetchKycData(trainerId:string):Promise<any>
    getAllTrainersKycDatas():Promise<any>
    updateKycStatus(status: string, trainer_id: string, rejectionReason: string | null):Promise<any>
    deleteKyc(trainer_id: string):Promise<void>



}