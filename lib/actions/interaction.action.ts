"use server";

import { ViewQuestionParams } from "@/types/shared.types";
import { connectToDatabase } from "../mongoose";
import Question from "@/database/question.model";
import Interaction from "@/database/interaction.model";

export async function viewQuestion(params: ViewQuestionParams) {
    try {
        await connectToDatabase();
        const {questionId, userId} = params;
        const question = await Question.findById(questionId);
        await Question.findByIdAndUpdate(questionId, { views: (Number(question.views) || 0) + 1});
        if(userId) {
            const existingInteraction = await Interaction.findOne({
                user: userId,
                action: 'view',
                question: questionId,
            })
            if(existingInteraction) return console.log('User already watched it.');
            await Interaction.create({
                user: userId,
                action: "view",
                question: questionId,
            })
        }
    } catch(error) {
        console.log(error);
        throw error;
    }
}