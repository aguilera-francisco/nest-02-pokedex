import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel : Model<Pokemon>
  ){
    
  }
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      if(error.code === 11000){
        throw new BadRequestException(`Pokemon already exists: ${JSON.stringify(error.keyValue)}`);
      }
      console.log(error);
      throw new InternalServerErrorException(`Error while creating pokemon, check logs`);
    }
  }

  async findAll() {
    return await this.pokemonModel.find();
  }

  async findOne(term: string) : Promise<Pokemon> {

    let pokemon: Pokemon;
    if(!isNaN(+term)){
      return await  this.pokemonModel.findOne({no: term})
    }
    
    if(isValidObjectId(term)){
      return await this.pokemonModel.findById(term);
    }
    pokemon =  await this.pokemonModel.findOne({name: term.toLowerCase().trim()});
    if(!pokemon){
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`);
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    await pokemon.updateOne(updatePokemonDto, {new: true});
    return {...pokemon.toJSON(), ...updatePokemonDto};
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
