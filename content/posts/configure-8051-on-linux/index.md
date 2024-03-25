---
title: "Configure 8051 on Linux"
date: 2024-03-26T02:44:59+08:00
---

## 0x00 前情提要

这几年我很喜欢做给自己用的产品，通常是根据自己的需求，一点一点的迭代，提升工作效率，我觉得很棒。尤其是接触到 suckless 这种针对 technical-users 的开发哲学后，写起来更带劲了。但问题在于，我掌握的技术栈还是偏软件。我只能解决电脑中的问题，但现实中的想法却难以实现。所以我准备从8051开始，学习一些硬件知识，以便能够实现自己的想法。

我目前的工作系统是Linux, 虽说在另个硬盘装了Windows，但几年也不开一下。之前看教程和相关资料，说是Windows下单片机开发资源比较丰富。但一番查阅后发现在Linux下开发单片机的方案也很成熟了，相关操作请您继续往下读。

## 0x01 识别8051
系统自带CH341驱动，按说插上就能识别，但执行`ls /dev/tty* | grep USB`却什么都没出现。最后一番搜索发现是[BRLTTY的问题](https://unix.stackexchange.com/a/670637/488519), 删除udev rules即可：

```shell
for f in /usr/lib/udev/rules.d/*brltty*.rules; do
    sudo ln -s /dev/null "/etc/udev/rules.d/$(basename "$f")"
done
sudo udevadm control --reload-rules
```

重启后就能看到`/dev/ttyUSB0`了。要是您的系统没有CH341驱动，还请STFW

## 0x02 安装Platform IO
安装VSCode,配置Platform IO还请参考[这篇文章](https://rymcu.com/article/137)

## 0x03 头文件
```c
/*-------------------------------------------------------------------------
   compiler.h
 
   Copyright (C) 2006, Maarten Brock, sourceforge.brock@dse.nl
   Portions of this file are Copyright 2014 Silicon Laboratories, Inc.
   http://developer.silabs.com/legal/version/v11/Silicon_Labs_Software_License_Agreement.txt
 
   This library is free software; you can redistribute it and/or modify it
   under the terms of the GNU General Public License as published by the
   Free Software Foundation; either version 2, or (at your option) any
   later version.
 
   This library is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   GNU General Public License for more details.
 
   You should have received a copy of the GNU General Public License 
   along with this library; see the file COPYING. If not, write to the
   Free Software Foundation, 51 Franklin Street, Fifth Floor, Boston,
   MA 02110-1301, USA.
 
   As a special exception, if you link this library with other files,
   some of which are compiled with SDCC, to produce an executable,
   this library does not by itself cause the resulting executable to
   be covered by the GNU General Public License. This exception does
   not however invalidate any other reasons why the executable file
   might be covered by the GNU General Public License.
-------------------------------------------------------------------------*/
 
 /*
  * Header file to overcome 8051 compiler differences for specifying
  * special function registers. The following compilers are supported:
  * SDCC, Keil, Raisonance, IAR, Hi-Tech, Tasking, Crossware, Wickenhaeuser.
  * Unfortunately not for use with Dunfield. The compilers are identified by
  * their unique predefined macros. See also:
  * http://predef.sourceforge.net/precomp.html
  *
  * SBIT and SFR define special bit and special function registers at the given
  * address. SFR16 and SFR32 define sfr combinations at adjacent addresses in
  * little-endian format. SFR16E and SFR32E define sfr combinations without
  * prerequisite byte order or adjacency. None of these multi-byte sfr
  * combinations will guarantee the order in which they are accessed when read
  * or written.
  * SFR16X and SFR32X for 16 bit and 32 bit xdata registers are not defined
  * to avoid portability issues because of compiler endianness.
  * SFR16LEX is provided for 16 bit little endian xdata registers. It is usable
  * on little endian compilers only; on big endian compilers, these registers
  * will not be defined.
  * This file is to be included in every microcontroller specific header file.
  * Example:
  *
  * // my_mcu.h: sfr definitions for my mcu
  * #include <compiler.h>
  *
  * SBIT  (P0_1, 0x80, 1);      // Port 0 pin 1
  *
  * SFR   (P0, 0x80);           // Port 0
  *
  * SFRX  (CPUCS, 0xE600);      // Cypress FX2 Control and Status register in xdata memory at 0xE600
  *
  * SFR16 (TMR2, 0xCC);         // Timer 2, lsb at 0xCC, msb at 0xCD
  *
  * SFR16E(TMR0, 0x8C8A);       // Timer 0, lsb at 0x8A, msb at 0x8C
  *
  * SFR32 (MAC0ACC, 0x93);      // SiLabs C8051F120 32 bits MAC0 Accumulator, lsb at 0x93, msb at 0x96
  *
  * SFR32E(SUMR, 0xE5E4E3E2);   // TI MSC1210 SUMR 32 bits Summation register, lsb at 0xE2, msb at 0xE5
  *
 */
 
#ifndef COMPILER_H
#define COMPILER_H
 
/** SDCC - Small Device C Compiler
  * http://sdcc.sf.net
 */
typedef enum {true=1,false=0}bool;
#if defined (SDCC) || defined (__SDCC)
# define SBIT(name, addr, bit)  __sbit  __at(addr+bit)                    name
# define SFR(name, addr)        __sfr   __at(addr)                        name
# define SFRX(name, addr)       __xdata volatile unsigned char __at(addr) name
# define SFR16(name, addr)      __sfr16 __at(((addr+1U)<<8) | addr)       name
# define SFR16E(name, fulladdr) __sfr16 __at(fulladdr)                    name
# define SFR16LEX(name, addr)   __xdata volatile unsigned short __at(addr) name
# define SFR32(name, addr)      __sfr32 __at(((addr+3UL)<<24) | ((addr+2UL)<<16) | ((addr+1UL)<<8) | addr) name
# define SFR32E(name, fulladdr) __sfr32 __at(fulladdr)                    name
 
# define INTERRUPT(name, vector) void name (void) __interrupt (vector)
# define INTERRUPT_USING(name, vector, regnum) void name (void) __interrupt (vector) __using (regnum)
 
// NOP () macro support
#define NOP() __asm NOP __endasm
 
/** Keil C51
  * http://www.keil.com
 */
#elif defined __CX51__
# define SBIT(name, addr, bit)  sbit  name = addr^bit
# define SFR(name, addr)        sfr   name = addr
# define SFRX(name, addr)       volatile unsigned char xdata name _at_ addr
# define SFR16(name, addr)      sfr16 name = addr
# define SFR16E(name, fulladdr) /* not supported */
# define SFR16LEX(name, addr)   /* not supported */
# define SFR32(name, fulladdr)  /* not supported */
# define SFR32E(name, fulladdr) /* not supported */
 
# define INTERRUPT(name, vector) void name (void) interrupt vector
# define INTERRUPT_USING(name, vector, regnum) void name (void) interrupt vector using regnum
 
// NOP () macro support
extern void _nop_ (void);
#define NOP() _nop_()
 
/** Raisonance
  * http://www.raisonance.com
 */
#elif defined __RC51__
# define SBIT(name, addr, bit)  at (addr+bit) sbit                   name
# define SFR(name, addr)        sfr at addr                          name
# define SFRX(name, addr)       xdata at addr volatile unsigned char name
# define SFR16(name, addr)      sfr16 at addr                        name
# define SFR16E(name, fulladdr) /* not supported */
# define SFR16LEX(name, addr)   /* not supported */
# define SFR32(name, fulladdr)  /* not supported */
# define SFR32E(name, fulladdr) /* not supported */
 
# define INTERRUPT(name, vector) void name (void) interrupt vector
# define INTERRUPT_USING(name, vector, regnum) void name (void) interrupt vector using regnum
 
// NOP () macro support -- NOP is opcode 0x00
#define NOP() asm { 0x00 }
 
/** IAR 8051
  * http://www.iar.com
 */
#elif defined __ICC8051__
# define SBIT(name, addr, bit)  __bit __no_init volatile bool name @ (addr+bit)
# define SFR(name, addr)        __sfr __no_init volatile unsigned char name @ addr
# define SFRX(name, addr)       __xdata __no_init volatile unsigned char name @ addr
# define SFR16(name, addr)      __sfr __no_init volatile unsigned int  name @ addr
# define SFR16E(name, fulladdr) /* not supported */
# define SFR16LEX(name, addr)   /* not supported */
# define SFR32(name, fulladdr)  __sfr __no_init volatile unsigned long name @ addr
# define SFR32E(name, fulladdr) /* not supported */
 
# define _PPTOSTR_(x) #x
# define _PPARAM_(address) _PPTOSTR_(vector=address * 8 + 3)
# define _PPARAM2_(regbank) _PPTOSTR_(register_bank=regbank)
# define INTERRUPT(name, vector) _Pragma(_PPARAM_(vector)) __interrupt void name(void)
# define INTERRUPT_USING(name, vector, regnum) _Pragma(_PPARAM2_(regnum)) _Pragma(_PPARAM_(vector)) __interrupt void name(void)
 
extern __intrinsic void __no_operation (void);
#define NOP() __no_operation()
 
/** Tasking / Altium
  * http://www.altium.com/tasking
 */
#elif defined _CC51
# define SBIT(name, addr, bit)  _sfrbit  name _at(addr+bit)
# define SFR(name, addr)        _sfrbyte name _at(addr)
# define SFRX(name, addr)       _xdat volatile unsigned char name _at(addr)
#if _CC51 > 71
# define SFR16(name, addr)      _sfrword _little name _at(addr)
#else
# define SFR16(name, addr)      /* not supported */
#endif
# define SFR16E(name, fulladdr) /* not supported */
# define SFR16LEX(name, addr)   /* not supported */
# define SFR32(name, fulladdr)  /* not supported */
# define SFR32E(name, fulladdr) /* not supported */
 
# define INTERRUPT(name, vector) _interrupt (vector) void name (void)
# define INTERRUPT_USING(name, vector, regnum) _interrupt (vector) _using(regnum) void name (void)
 
// NOP () macro support
extern void _nop (void);
#define NOP() _nop()
 
/** Hi-Tech 8051
  * http://www.htsoft.com
 */
#elif defined HI_TECH_C
# define SBIT(name, addr, bit)  volatile bit           name @ (addr+bit)
# define SFR(name, addr)        volatile unsigned char name @ addr
# define SFRX(name, addr)       volatile far unsigned char name @ addr
# define SFR16(name, addr)      /* not supported */
# define SFR16E(name, fulladdr) /* not supported */
# define SFR16LEX(name, addr)   /* not supported */
# define SFR32(name, fulladdr)  /* not supported */
# define SFR32E(name, fulladdr) /* not supported */
 
# define INTERRUPT(name, vector)       void name (void) interrupt vector
# define INTERRUPT_PROTO(name, vector)
 
// NOP () macro support
#define NOP() asm(" nop ")
 
/** Crossware
  * http://www.crossware.com
 */
#elif defined _XC51_VER
# define SBIT(name, addr, bit)  _sfrbit  name = (addr+bit)
# define SFR(name, addr)        _sfr     name = addr
# define SFRX(name, addr)       volatile unsigned char _xdata name _at addr
# define SFR16(name, addr)      _sfrword name = addr
# define SFR16E(name, fulladdr) /* not supported */
# define SFR16LEX(name, addr)   /* not supported */
# define SFR32(name, fulladdr)  /* not supported */
# define SFR32E(name, fulladdr) /* not supported */
 
/** Wickenhaeuser
  * http://www.wickenhaeuser.de
 */
#elif defined __UC__
# define SBIT(name, addr, bit)  unsigned char bit  name @ (addr+bit)
# define SFR(name, addr)        near unsigned char name @ addr
# define SFRX(name, addr)       xdata volatile unsigned char name @ addr
# define SFR16(name, addr)      /* not supported */
# define SFR16E(name, fulladdr) /* not supported */
# define SFR16LEX(name, addr)   /* not supported */
# define SFR32(name, fulladdr)  /* not supported */
# define SFR32E(name, fulladdr) /* not supported */
 
/** default
  * unrecognized compiler
 */
#else
# warning unrecognized compiler
# define SBIT(name, addr, bit)  volatile bool           name
# define SFR(name, addr)        volatile unsigned char  name
# define SFRX(name, addr)       volatile unsigned char  name
# define SFR16(name, addr)      volatile unsigned short name
# define SFR16E(name, fulladdr) volatile unsigned short name
# define SFR16LEX(name, addr)   volatile unsigned short name
# define SFR32(name, fulladdr)  volatile unsigned long  name
# define SFR32E(name, fulladdr) volatile unsigned long  name
 
#endif
 
#endif //COMPILER_H
```

```c
#ifndef STC89xx_H
#define STC89xx_H
 
#include <compiler.h>
 
// 适用于 STC89xx / STC90xx 系列的芯片
// Modified based on STC-ISP version by: ZnHoCn
 
/* The following is STC additional SFR*/
 
/*
 * #define _AUXR 0x8e
 * SFR(AUXR, 0x8e);
 * #define _AUXR1 0xa2
 * SFR(AUXR1, 0xa2);
 * #define _IPH 0xb7
 * SFR(IPH, 0xb7);
 */
 
#define _P4 0xe8
SFR(P4, 0xe8);
SBIT(P46, _P4, 6);
SBIT(P45, _P4, 5);      //ISP下载需勾选"ALE脚用作P4.5口"
SBIT(P44, _P4, 4);
SBIT(P43, _P4, 3);
SBIT(P42, _P4, 2);
SBIT(P41, _P4, 1);
SBIT(P40, _P4, 0);
 
#define _XICON 0xc0
SFR(XICON, 0xc0);
 
#define _WDT_CONTR 0xe1
SFR(WDT_CONTR, 0xe1);
 
#define _ISP_DATA 0xe2
SFR(ISP_DATA, 0xe2);
#define _ISP_ADDRH 0xe3
SFR(ISP_ADDRH, 0xe3);
#define _ISP_ADDRL 0xe4
SFR(ISP_ADDRL, 0xe4);
#define _ISP_CMD 0xe5
SFR(ISP_CMD, 0xe5);
#define _ISP_TRIG 0xe6
SFR(ISP_TRIG, 0xe6);
#define _ISP_CONTR 0xe7
SFR(ISP_CONTR, 0xe7);
 
/* Above is STC additional SFR */
 
/*--------------------------------------------------------------------------
REG51F.H
 
Header file for 8xC31/51, 80C51Fx, 80C51Rx+
Copyright (c) 1988-1999 Keil Elektronik GmbH and Keil Software, Inc.
All rights reserved.
 
Modification according to DataSheet from April 1999
 - SFR's AUXR and AUXR1 added for 80C51Rx+ derivatives
--------------------------------------------------------------------------*/
 
/*  BYTE Registers  */
#define _P0 0x80
SFR(P0, 0x80);
SBIT(P00, _P0, 0);
SBIT(P01, _P0, 1);
SBIT(P02, _P0, 2);
SBIT(P03, _P0, 3);
SBIT(P04, _P0, 4);
SBIT(P05, _P0, 5);
SBIT(P06, _P0, 6);
SBIT(P07, _P0, 7);
#define _P1 0x90
SFR(P1, 0x90);
SBIT(P10, _P1, 0);
SBIT(P11, _P1, 1);
SBIT(P12, _P1, 2);
SBIT(P13, _P1, 3);
SBIT(P14, _P1, 4);
SBIT(P15, _P1, 5);
SBIT(P16, _P1, 6);
SBIT(P17, _P1, 7);
#define _P2 0xA0
SFR(P2, 0xA0);
SBIT(P20, _P2, 0);
SBIT(P21, _P2, 1);
SBIT(P22, _P2, 2);
SBIT(P23, _P2, 3);
SBIT(P24, _P2, 4);
SBIT(P25, _P2, 5);
SBIT(P26, _P2, 6);
SBIT(P27, _P2, 7);
#define _P3 0xB0
SFR(P3, 0xB0);
SBIT(P30, _P3, 0);
SBIT(P31, _P3, 1);
SBIT(P32, _P3, 2);
SBIT(P33, _P3, 3);
SBIT(P34, _P3, 4);
SBIT(P35, _P3, 5);
SBIT(P36, _P3, 6);
SBIT(P37, _P3, 7);
#define _PSW 0xD0
SFR(PSW, 0xD0);
#define _ACC 0xE0
SFR(ACC, 0xE0);
#define _B 0xF0
SFR(B, 0xF0);
#define _SP 0x81
SFR(SP, 0x81);
#define _DPL 0x82
SFR(DPL, 0x82);
#define _DPH 0x83
SFR(DPH, 0x83);
#define _PCON 0x87
SFR(PCON, 0x87);
#define _TCON 0x88
SFR(TCON, 0x88);
#define _TMOD 0x89
SFR(TMOD, 0x89);
#define _TL0 0x8A
SFR(TL0, 0x8A);
#define _TL1 0x8B
SFR(TL1, 0x8B);
#define _TH0 0x8C
SFR(TH0, 0x8C);
#define _TH1 0x8D
SFR(TH1, 0x8D);
#define _IE 0xA8
SFR(IE, 0xA8);
#define _IP 0xB8
SFR(IP, 0xB8);
#define _SCON 0x98
SFR(SCON, 0x98);
#define _SBUF 0x99
SFR(SBUF, 0x99);
 
/*  80C51Fx/Rx Extensions  */
#define _AUXR 0x8E
SFR(AUXR, 0x8E);
#define _AUXR1 0xA2
SFR(AUXR1, 0xA2);
#define _SADDR 0xA9
SFR(SADDR, 0xA9);
#define _IPH 0xB7
SFR(IPH, 0xB7);
#define _SADEN 0xB9
SFR(SADEN, 0xB9);
#define _T2CON 0xC8
SFR(T2CON, 0xC8);
#define _T2MOD 0xC9
SFR(T2MOD, 0xC9);
#define _RCAP2L 0xCA
SFR(RCAP2L, 0xCA);
#define _RCAP2H 0xCB
SFR(RCAP2H, 0xCB);
#define _TL2 0xCC
SFR(TL2, 0xCC);
#define _TH2 0xCD
SFR(TH2, 0xCD);
 
/* PCA SFR
#define _CCON 0xD8
SFR(CCON, 0xD8);
#define _CMOD 0xD9
SFR(CMOD, 0xD9);
#define _CCAPM0 0xDA
SFR(CCAPM0, 0xDA);
#define _CCAPM1 0xDB
SFR(CCAPM1, 0xDB);
#define _CCAPM2 0xDC
SFR(CCAPM2, 0xDC);
#define _CCAPM3 0xDD
SFR(CCAPM3, 0xDD);
#define _CCAPM4 0xDE
SFR(CCAPM4, 0xDE);
#define _CL 0xE9
SFR(CL, 0xE9);
#define _CCAP0L 0xEA
SFR(CCAP0L, 0xEA);
#define _CCAP1L 0xEB
SFR(CCAP1L, 0xEB);
#define _CCAP2L 0xEC
SFR(CCAP2L, 0xEC);
#define _CCAP3L 0xED
SFR(CCAP3L, 0xED);
#define _CCAP4L 0xEE
SFR(CCAP4L, 0xEE);
#define _CH 0xF9
SFR(CH, 0xF9);
#define _CCAP0H 0xFA
SFR(CCAP0H, 0xFA);
#define _CCAP1H 0xFB
SFR(CCAP1H, 0xFB);
#define _CCAP2H 0xFC
SFR(CCAP2H, 0xFC);
#define _CCAP3H 0xFD
SFR(CCAP3H, 0xFD);
#define _CCAP4H 0xFE
SFR(CCAP4H, 0xFE);
*/
 
/*  BIT Registers  */
/*  PSW   */
SBIT(CY, _PSW, 7);
SBIT(AC, _PSW, 6);
SBIT(F0, _PSW, 5);
SBIT(RS1, _PSW, 4);
SBIT(RS0, _PSW, 3);
SBIT(OV, _PSW, 2);
SBIT(P, _PSW, 0);
 
/*  TCON  */
SBIT(TF1, _TCON, 7);
SBIT(TR1, _TCON, 6);
SBIT(TF0, _TCON, 5);
SBIT(TR0, _TCON, 4);
SBIT(IE1, _TCON, 3);
SBIT(IT1, _TCON, 2);
SBIT(IE0, _TCON, 1);
SBIT(IT0, _TCON, 0);
 
/*  IE   */
SBIT(EA, _IE, 7);
SBIT(EC, _IE, 6);
SBIT(ET2, _IE, 5);
SBIT(ES, _IE, 4);
SBIT(ET1, _IE, 3);
SBIT(EX1, _IE, 2);
SBIT(ET0, _IE, 1);
SBIT(EX0, _IE, 0);
 
/*  IP   */
/*  SBIT(PPC, _IP, 6);*/
SBIT(PT2, _IP, 5);
SBIT(PS, _IP, 4);
SBIT(PT1, _IP, 3);
SBIT(PX1, _IP, 2);
SBIT(PT0, _IP, 1);
SBIT(PX0, _IP, 0);
 
/*  P3  */
SBIT(RD, _P3, 7);
SBIT(WR, _P3, 6);
SBIT(T1, _P3, 5);
SBIT(T0, _P3, 4);
SBIT(INT1, _P3, 3);
SBIT(INT0, _P3, 2);
SBIT(TXD, _P3, 1);
SBIT(RXD, _P3, 0);
 
/*  SCON  */
SBIT(SM0, _SCON, 7);        // alternatively "FE"
SBIT(FE, _SCON, 7);
SBIT(SM1, _SCON, 6);
SBIT(SM2, _SCON, 5);
SBIT(REN, _SCON, 4);
SBIT(TB8, _SCON, 3);
SBIT(RB8, _SCON, 2);
SBIT(TI, _SCON, 1);
SBIT(RI, _SCON, 0);
 
/*  P1  */
/* PCA
SBIT(CEX4, _P1, 7);
SBIT(CEX3, _P1, 6);
SBIT(CEX2, _P1, 5);
SBIT(CEX1, _P1, 4);
SBIT(CEX0, _P1, 3);
SBIT(ECI, _P1, 2);
*/
 
SBIT(T2EX, _P1, 1);
SBIT(T2, _P1, 0);
 
/*  T2CON  */
SBIT(TF2, _T2CON, 7);
SBIT(EXF2, _T2CON, 6);
SBIT(RCLK, _T2CON, 5);
SBIT(TCLK, _T2CON, 4);
SBIT(EXEN2, _T2CON, 3);
SBIT(TR2, _T2CON, 2);
SBIT(C_T2, _T2CON, 1);
SBIT(CP_RL2, _T2CON, 0);
 
/*  CCON  */
/*  PCA
SBIT(CF, _CCON, 7);
SBIT(CR, _CCON, 6);
 
SBIT(CCF4, _CCON, 4);
SBIT(CCF3, _CCON, 3);
SBIT(CCF2, _CCON, 2);
SBIT(CCF1, _CCON, 1);
SBIT(CCF0, _CCON, 0);
*/
 
#endif
```
感谢[这篇文章](http://fengbohan.com/index.php/2022/02/06/51%E5%AD%A6%E4%B9%A0%EF%BC%881%EF%BC%89%EF%BC%9Avscodeplatformio-%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA/)

## 0x04 上传问题 
一切都配置好后，如果您和我一样，都卡在了`Cycling Power: done`，请参考[这篇文章](http://www.51hei.com/bbs/dpj-214112-1.html#post_1129325)，简单来说就是删了stcgal的-a参数，删了就好了，具体原因我没细看。