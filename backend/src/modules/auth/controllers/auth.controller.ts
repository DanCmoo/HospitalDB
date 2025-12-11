import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Session,
  ValidationPipe,
  UsePipes,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { ActivityLogService } from '../services/activity-log.service';
import { CreateUsuarioDto, UpdateUsuarioDto, UsuarioResponseDto, LoginDto, ActivityLogResponseDto } from '../dtos';
import { Public, CurrentUser, Roles } from '../decorators';
import { AuthGuard, RolesGuard } from '../guards';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(AuthGuard, RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() createDto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    return this.authService.register(createDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Session() session: Record<string, any>,
    @Req() req: Request,
  ): Promise<UsuarioResponseDto> {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const user = await this.authService.login(loginDto, ipAddress);
    
    // Guardar usuario en sesión
    session.user = {
      idUsuario: user.idUsuario,
      username: user.username,
      rol: user.rol,
      numDoc: user.numDoc,
    };

    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Session() session: Record<string, any>): Promise<{ message: string }> {
    session.destroy((err: any) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    });
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Get('profile')
  async getProfile(@CurrentUser() currentUser: any): Promise<UsuarioResponseDto> {
    return this.authService.findById(currentUser.idUsuario);
  }

  @Get('session')
  async checkSession(@Session() session: Record<string, any>): Promise<{ authenticated: boolean; user?: any }> {
    return {
      authenticated: !!session.user,
      user: session.user || null,
    };
  }

  @Roles('administrador')
  @Get('usuarios')
  async findAll(@Query('rol') rol?: string): Promise<UsuarioResponseDto[]> {
    if (rol) {
      return this.authService.findByRol(rol);
    }
    return this.authService.findAll();
  }

  @Roles('administrador')
  @Get('usuarios/:id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UsuarioResponseDto> {
    return this.authService.findById(id);
  }

  @Put('change-password')
  async changePassword(
    @CurrentUser() currentUser: any,
    @Body() body: { oldPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    await this.authService.changePassword(currentUser.idUsuario, body.oldPassword, body.newPassword);
    return { message: 'Contraseña actualizada exitosamente' };
  }

  @Roles('administrador')
  @Put('usuarios/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUsuarioDto,
    @CurrentUser() currentUser: any,
  ): Promise<UsuarioResponseDto> {
    return this.authService.update(id, updateDto, currentUser.idUsuario);
  }

  @Roles('administrador')
  @Post('usuarios/:id/reset-password')
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { newPassword: string },
    @CurrentUser() currentUser: any,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(id, body.newPassword, currentUser.idUsuario);
    return { message: 'Contraseña restablecida exitosamente' };
  }

  @Roles('administrador')
  @Delete('usuarios/:id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: any,
  ): Promise<{ message: string }> {
    await this.authService.delete(id, currentUser.idUsuario);
    return { message: 'Usuario eliminado exitosamente' };
  }

  @Roles('administrador')
  @Get('activity-logs')
  async getAllActivityLogs(@Query('limit', ParseIntPipe) limit: number = 100): Promise<ActivityLogResponseDto[]> {
    return this.activityLogService.getAllActivity(limit);
  }

  @Roles('administrador')
  @Get('usuarios/:id/activity-logs')
  async getUserActivityLogs(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ParseIntPipe) limit: number = 50,
  ): Promise<ActivityLogResponseDto[]> {
    return this.activityLogService.getUserActivityHistory(id, limit);
  }
}
